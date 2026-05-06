import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative } from 'node:path'

interface TestResult {
  workerIndex: number
  status: string
  attachments: Array<{
    name: string
    contentType: string
    path: string
  }>
}

interface Spec {
  title: string
  tests: Array<{
    results: TestResult[]
  }>
}

interface Suite {
  title: string
  specs: Spec[]
  suites: Suite[]
}

interface JsonReport {
  config: { projectPath?: string }
  suites: Suite[]
}

async function getDuration(filePath: string): Promise<number> {
  const proc = Bun.spawn(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', filePath], { stdout: 'pipe' })
  await proc.exited
  const text = await new Response(proc.stdout).text()
  return parseFloat(text.trim()) || 0
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

function traverseSuites(suites: Suite[], path: string[]): Array<{ name: string; result: TestResult }> {
  const results: Array<{ name: string; result: TestResult }> = []
  
  for (const suite of suites) {
    const currentPath = [...path, suite.title]
    // Process specs in this suite
    for (const spec of suite.specs) {
      const testName = [...currentPath, spec.title].join(' › ')
      for (const test of spec.tests) {
        for (const result of test.results) {
          results.push({ name: testName, result })
        }
      }
    }
    // Recurse into nested suites
    if (suite.suites) {
      results.push(...traverseSuites(suite.suites, currentPath))
    }
  }
  
  return results
}

async function main() {
  const resultsPath = 'test-results/results.json'
  if (!existsSync(resultsPath)) {
    console.error('No results.json found. Run tests with PLAYWRIGHT_VIDEO=on first.')
    process.exit(1)
  }

  const report: JsonReport = JSON.parse(await readFile(resultsPath, 'utf-8'))

  const videos: Array<{ path: string; name: string; duration: number }> = []

  const allResults = traverseSuites(report.suites, [])
  
  for (const { name, result } of allResults) {
    for (const attachment of result.attachments) {
      if (attachment.contentType === 'video/webm' && attachment.path) {
        videos.push({ path: attachment.path, name, duration: 0 })
      }
    }
  }

  if (videos.length === 0) {
    console.error('No videos found in test results.')
    process.exit(1)
  }

  console.log(`Found ${videos.length} videos`)

  for (const video of videos) {
    video.duration = await getDuration(video.path)
  }

  const concatFile = '/tmp/concat-list.txt'
  const srtFile = '/tmp/subtitles.srt'
  const outputFile = 'test-results/combined.mp4'

  await writeFile(concatFile, videos.map(v => `file '${v.path}'`).join('\n'))

  let srtContent = ''
  let currentTime = 0
  let subtitleIndex = 1

  for (const video of videos) {
    const startTime = currentTime
    const endTime = currentTime + video.duration

    srtContent += `${subtitleIndex}\n`
    srtContent += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`
    srtContent += `${video.name}\n\n`

    currentTime = endTime
    subtitleIndex++
  }

  await writeFile(srtFile, srtContent)

  // Create a temp file for ffmpeg filter to avoid shell escaping issues
  const filterFile = '/tmp/ffmpeg-filter.txt'
  const filterComplex = `[0:v]subtitles='${srtFile}':force_style='FontSize=16\\,PrimaryColour=&Hffffff\\,OutlineColour=&H000000\\,Outline=1\\,Alignment=2\\,MarginV=20'[v]`
  await writeFile(filterFile, filterComplex)

  const ffmpegCmd = [
    'ffmpeg',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatFile,
    '-/filter_complex', filterFile,
    '-map', '[v]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'medium',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-y',
    outputFile,
  ].join(' ')

  console.log('Combining videos with subtitles...')
  await Bun.spawn(['bash', '-c', ffmpegCmd], { stdout: 'inherit', stderr: 'inherit' }).exited

  console.log(`\nDone! Output: ${outputFile}`)
}

main().catch(console.error)

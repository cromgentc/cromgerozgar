import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const androidDir = join(root, 'android')
const javaHome = process.env.JAVA_HOME || 'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.11.10-hotspot'
const androidHome = process.env.ANDROID_HOME || join(root, 'android-sdk')
const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'

if (!existsSync(join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'))) {
  console.error(`JAVA_HOME is not valid: ${javaHome}`)
  process.exit(1)
}

if (!existsSync(androidHome)) {
  console.error(`ANDROID_HOME is not valid: ${androidHome}`)
  process.exit(1)
}

const result = spawnSync(gradle, ['assembleDebug'], {
  cwd: androidDir,
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    ANDROID_HOME: androidHome,
    ANDROID_SDK_ROOT: androidHome,
    Path: `${join(javaHome, 'bin')};${join(androidHome, 'platform-tools')};${process.env.Path || ''}`,
  },
  shell: true,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)

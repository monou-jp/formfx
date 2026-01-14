import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // E2Eテストが配置されているディレクトリのみを対象にする
    testDir: './tests/e2e',
    // もし tests 直下に混在している場合は、ユニットテストファイルを無視する設定を追加
    testIgnore: ['**/*.spec.ts', '**/*.test.ts'],
    // E2E用のファイルパターンを明示する場合
    testMatch: '**/*.e2e.ts',

    use: {
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
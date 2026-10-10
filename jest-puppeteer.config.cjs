module.exports = {
    server: {
        command: 'npx serve dist -l 3000',
        port: 3000,
        launchTimeout: 50000,
    },
    launch: {
        // CI runners (ubuntu-24.04) block Chrome's user namespace sandbox
        args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    },
};

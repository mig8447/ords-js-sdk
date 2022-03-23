export default {
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [ '@semantic-release/git', {
            // Per documentation:
            // Note: If a file has a match in assets it will be included even if it also has a match in .gitignore.
            assets: [
                'CHANGELOG.md',
                'package.json',
                'package-lock.json',
                'npm-shrinkwrap.json',
                [
                    'dist/**'
                ],
            ]
        } ]
    ],
    preset: 'conventionalcommits',
    // Allow running locally to save GitLab CI minutes
    ci: false
};

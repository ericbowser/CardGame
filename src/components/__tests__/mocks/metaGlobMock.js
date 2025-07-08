// metaGlobMock.js
export function setupMetaGlobMock(files) {
    global.importMetaGlobMock = function (pattern) {
        // Simulate the import.meta.glob behavior based on the supplied files
        const mockResult = {};
        Object.keys(files).forEach((filePath) => {
            if (filePath.match(pattern)) {
                mockResult[filePath] = () => Promise.resolve(files[filePath]);
            }
        });
        return mockResult;
    }
}
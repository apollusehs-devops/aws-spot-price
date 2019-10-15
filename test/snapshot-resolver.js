module.exports = {
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    testPath.replace('/src/', '/test/__snapshots__/') + snapshotExtension,
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace('/test/__snapshots__/', '/src/').slice(0, -snapshotExtension.length),
  testPathForConsistencyCheck: 'src/lib.spec.ts',
};

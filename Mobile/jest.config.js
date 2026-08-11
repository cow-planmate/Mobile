module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    // 번들 크기 절감을 위해 lucide-react-native를 개별 아이콘 경로로 import한다
    // (esm/icons/<name>). 이 서브패스는 package.json exports에 없어 Jest 리졸버가
    // 못 찾는다 — Metro는 파일 기반으로 폴백하지만 Jest는 바로 실패한다. cjs 버전은
    // require()로 그대로 돌아가므로 그쪽으로 매핑한다.
    '^lucide-react-native/dist/esm/icons/(.*)$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/icons/$1.js',
  },
};

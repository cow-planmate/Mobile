/**
 * lucide-react-native는 배럴(barrel) import 시 3천여 개 아이콘 모듈을 전부 번들에
 * 끌어들여, 실제 쓰는 아이콘 몇 개만 있어도 번들 크기가 크게 늘어난다. 개별 아이콘을
 * 'lucide-react-native/dist/esm/icons/<kebab-name>' 경로로 직접 import해 우회하는데,
 * 이 서브패스는 패키지의 package.json "exports" 맵에 선언돼 있지 않아 tsc가 타입을
 * 찾지 못한다. Metro는 unstable_enablePackageExports 설정에서도 해당 파일이 실제로
 * 존재하면 런타임 해석에는 문제가 없다.
 */
declare module 'lucide-react-native/dist/esm/icons/*' {
  import type { LucideIcon } from 'lucide-react-native';
  const icon: LucideIcon;
  export default icon;
}

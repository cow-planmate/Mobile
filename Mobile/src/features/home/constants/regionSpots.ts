import { ImageSourcePropType } from 'react-native';

export type RegionSpot = {
  place: string;
  roman: string;
  image: ImageSourcePropType;
};

/**
 * 여행지별 대표 명소. 키는 `DESTINATIONS_28`의 도시 이름과 같아야 한다.
 * 한 지역당 1~5장을 넣으며, 사진 개수에 따라 히어로 진행바가 자동으로 맞춰진다.
 * 사진이 없는 지역은 키를 비워 두면 화면이 안내 문구로 대체한다.
 *
 * 사진 출처와 라이선스는 src/assets/images/home/CREDITS.md 참고.
 */
export const REGION_SPOTS: Record<string, RegionSpot[]> = {
  서울: [
    {
      place: '경복궁',
      roman: 'Gyeongbokgung',
      image: require('../../../assets/images/home/seoul-gyeongbokgung.jpg'),
    },
    {
      place: '북촌한옥마을',
      roman: 'Bukchon Hanok Village',
      image: require('../../../assets/images/home/seoul-bukchon.jpg'),
    },
    {
      place: '남산서울타워',
      roman: 'N Seoul Tower',
      image: require('../../../assets/images/home/seoul-namsan.jpg'),
    },
  ],
  인천: [
    {
      place: '인천차이나타운',
      roman: 'Incheon Chinatown',
      image: require('../../../assets/images/home/incheon-chinatown.jpg'),
    },
    {
      place: '송도센트럴파크',
      roman: 'Songdo Central Park',
      image: require('../../../assets/images/home/incheon-songdo.jpg'),
    },
  ],
  수원: [
    {
      place: '수원화성',
      roman: 'Hwaseong Fortress',
      image: require('../../../assets/images/home/suwon-hwaseong.jpg'),
    },
    {
      place: '방화수류정',
      roman: 'Banghwasuryujeong',
      image: require('../../../assets/images/home/suwon-banghwasuryujeong.jpg'),
    },
    {
      place: '화홍문',
      roman: 'Hwahongmun',
      image: require('../../../assets/images/home/suwon-hwahongmun.jpg'),
    },
  ],
  가평: [
    {
      place: '아침고요수목원',
      roman: 'Garden of Morning Calm',
      image: require('../../../assets/images/home/gapyeong-morningcalm.jpg'),
    },
  ],
  강릉: [
    {
      place: '경포호',
      roman: 'Gyeongpo Lake',
      image: require('../../../assets/images/home/gangneung-gyeongpo.jpg'),
    },
    {
      place: '오죽헌',
      roman: 'Ojukheon',
      image: require('../../../assets/images/home/gangneung-ojukheon.jpg'),
    },
    {
      place: '정동진해변',
      roman: 'Jeongdongjin Beach',
      image: require('../../../assets/images/home/gangneung-jeongdongjin.jpg'),
    },
  ],
  속초: [
    {
      place: '울산바위',
      roman: 'Ulsanbawi',
      image: require('../../../assets/images/home/sokcho-ulsanbawi.jpg'),
    },
    {
      place: '속초등대',
      roman: 'Sokcho Lighthouse',
      image: require('../../../assets/images/home/sokcho-yeonggeumjeong.jpg'),
    },
  ],
  춘천: [
    {
      place: '소양강스카이워크',
      roman: 'Soyanggang Skywalk',
      image: require('../../../assets/images/home/chuncheon-soyanggang.jpg'),
    },
    {
      place: '청평사',
      roman: 'Cheongpyeongsa',
      image: require('../../../assets/images/home/chuncheon-cheongpyeongsa.jpg'),
    },
  ],
  평창: [
    {
      place: '알펜시아 스키점프센터',
      roman: 'Alpensia Ski Jump',
      image: require('../../../assets/images/home/pyeongchang-alpensia.jpg'),
    },
    {
      place: '대관령양떼목장',
      roman: 'Daegwallyeong Sheep Ranch',
      image: require('../../../assets/images/home/pyeongchang-daegwallyeong.jpg'),
    },
    {
      place: '오대산',
      roman: 'Odaesan',
      image: require('../../../assets/images/home/pyeongchang-odaesan.jpg'),
    },
  ],
  양양: [
    {
      place: '낙산사',
      roman: 'Naksansa',
      image: require('../../../assets/images/home/yangyang-naksansa.jpg'),
    },
  ],
  대전: [
    {
      place: '엑스포다리',
      roman: 'Expo Bridge',
      image: require('../../../assets/images/home/daejeon-expobridge.jpg'),
    },
    {
      place: '한밭수목원',
      roman: 'Hanbat Arboretum',
      image: require('../../../assets/images/home/daejeon-hanbat.jpg'),
    },
  ],
  공주: [
    {
      place: '공산성',
      roman: 'Gongsanseong',
      image: require('../../../assets/images/home/gongju-gongsanseong.jpg'),
    },
    {
      place: '마곡사',
      roman: 'Magoksa',
      image: require('../../../assets/images/home/gongju-magoksa.jpg'),
    },
  ],
  부여: [
    {
      place: '궁남지',
      roman: 'Gungnamji',
      image: require('../../../assets/images/home/buyeo-gungnamji.jpg'),
    },
    {
      place: '낙화암',
      roman: 'Nakhwaam',
      image: require('../../../assets/images/home/buyeo-nakhwaam.jpg'),
    },
    {
      place: '정림사지',
      roman: 'Jeongnimsa Site',
      image: require('../../../assets/images/home/buyeo-jeongnimsa.jpg'),
    },
  ],
  태안: [
    {
      place: '신두리 해안사구',
      roman: 'Sinduri Sand Dune',
      image: require('../../../assets/images/home/taean-sinduri.jpg'),
    },
    {
      place: '꽃지해수욕장',
      roman: 'Kkotji Beach',
      image: require('../../../assets/images/home/taean-kkotji.jpg'),
    },
  ],
  전주: [
    {
      place: '전주한옥마을',
      roman: 'Jeonju Hanok Village',
      image: require('../../../assets/images/home/jeonju-hanok.jpg'),
    },
    {
      place: '경기전',
      roman: 'Gyeonggijeon',
      image: require('../../../assets/images/home/jeonju-gyeonggijeon.jpg'),
    },
    {
      place: '오목대',
      roman: 'Omokdae',
      image: require('../../../assets/images/home/jeonju-omokdae.jpg'),
    },
  ],
  여수: [
    {
      place: '오동도',
      roman: 'Odongdo',
      image: require('../../../assets/images/home/yeosu-odongdo.jpg'),
    },
    {
      place: '돌산대교',
      roman: 'Dolsan Bridge',
      image: require('../../../assets/images/home/yeosu-dolsan.jpg'),
    },
  ],
  순천: [
    {
      place: '순천만습지',
      roman: 'Suncheon Bay Wetland',
      image: require('../../../assets/images/home/suncheon-wetland.jpg'),
    },
    {
      place: '낙안읍성',
      roman: 'Naganeupseong',
      image: require('../../../assets/images/home/suncheon-naganeupseong.jpg'),
    },
  ],
  광주: [
    {
      place: '무등산',
      roman: 'Mudeungsan',
      image: require('../../../assets/images/home/gwangju-mudeungsan.jpg'),
    },
    {
      place: '사직공원 전망타워',
      roman: 'Sajik Park Tower',
      image: require('../../../assets/images/home/gwangju-sajik.jpg'),
    },
  ],
  담양: [
    {
      place: '죽녹원',
      roman: 'Juknokwon',
      image: require('../../../assets/images/home/damyang-juknokwon.jpg'),
    },
    {
      place: '메타세쿼이아길',
      roman: 'Metasequoia Road',
      image: require('../../../assets/images/home/damyang-metasequoia.jpg'),
    },
    {
      place: '소쇄원',
      roman: 'Soswaewon',
      image: require('../../../assets/images/home/damyang-soswaewon.jpg'),
    },
  ],
  목포: [
    {
      place: '목포해상케이블카',
      roman: 'Mokpo Cable Car',
      image: require('../../../assets/images/home/mokpo-cablecar.jpg'),
    },
    {
      place: '갓바위',
      roman: 'Gatbawi',
      image: require('../../../assets/images/home/mokpo-gatbawi.jpg'),
    },
  ],
  부산: [
    {
      place: '해운대해수욕장',
      roman: 'Haeundae Beach',
      image: require('../../../assets/images/home/busan-haeundae.jpg'),
    },
    {
      place: '감천문화마을',
      roman: 'Gamcheon Culture Village',
      image: require('../../../assets/images/home/busan-gamcheon.jpg'),
    },
    {
      place: '광안대교',
      roman: 'Gwangan Bridge',
      image: require('../../../assets/images/home/busan-gwangan.jpg'),
    },
  ],
  대구: [
    {
      place: '83타워',
      roman: '83 Tower',
      image: require('../../../assets/images/home/daegu-tower83.jpg'),
    },
    {
      place: '수성못',
      roman: 'Suseong Lake',
      image: require('../../../assets/images/home/daegu-suseong.jpg'),
    },
  ],
  경주: [
    {
      place: '첨성대',
      roman: 'Cheomseongdae',
      image: require('../../../assets/images/home/gyeongju-cheomseongdae.jpg'),
    },
    {
      place: '불국사',
      roman: 'Bulguksa',
      image: require('../../../assets/images/home/gyeongju-bulguksa.jpg'),
    },
    {
      place: '동궁과 월지',
      roman: 'Donggung and Wolji',
      image: require('../../../assets/images/home/gyeongju-wolji.jpg'),
    },
  ],
  안동: [
    {
      place: '하회마을',
      roman: 'Hahoe Folk Village',
      image: require('../../../assets/images/home/andong-hahoe.jpg'),
    },
    {
      place: '월영교',
      roman: 'Woryeonggyo Bridge',
      image: require('../../../assets/images/home/andong-woryeonggyo.jpg'),
    },
  ],
  통영: [
    {
      place: '동피랑벽화마을',
      roman: 'Dongpirang',
      image: require('../../../assets/images/home/tongyeong-dongpirang.jpg'),
    },
    {
      place: '미륵산 케이블카',
      roman: 'Mireuksan Cable Car',
      image: require('../../../assets/images/home/tongyeong-mireuksan.jpg'),
    },
  ],
  거제: [
    {
      place: '해금강',
      roman: 'Haegeumgang',
      image: require('../../../assets/images/home/geoje-haegeumgang.jpg'),
    },
    {
      place: '외도 보타니아',
      roman: 'Oedo Botania',
      image: require('../../../assets/images/home/geoje-oedo.jpg'),
    },
  ],
  남해: [
    {
      place: '다랭이마을',
      roman: 'Daraengi Village',
      image: require('../../../assets/images/home/namhae-daraengi.jpg'),
    },
    {
      place: '독일마을',
      roman: 'German Village',
      image: require('../../../assets/images/home/namhae-german.jpg'),
    },
  ],
  제주: [
    {
      place: '성산일출봉',
      roman: 'Seongsan Ilchulbong',
      image: require('../../../assets/images/home/jeju-seongsan.jpg'),
    },
    {
      place: '한라산',
      roman: 'Hallasan',
      image: require('../../../assets/images/home/jeju-hallasan.jpg'),
    },
    {
      place: '협재해수욕장',
      roman: 'Hyeopjae Beach',
      image: require('../../../assets/images/home/jeju-hyeopjae.jpg'),
    },
  ],
  서귀포: [
    {
      place: '천지연폭포',
      roman: 'Cheonjiyeon Waterfall',
      image: require('../../../assets/images/home/seogwipo-cheonjiyeon.jpg'),
    },
    {
      place: '주상절리대',
      roman: 'Jusangjeolli Cliff',
      image: require('../../../assets/images/home/seogwipo-jusangjeolli.jpg'),
    },
  ],
};

export const MAX_REGION_SPOTS = 5;

export const getRegionSpots = (destination: string): RegionSpot[] => {
  const spots = REGION_SPOTS[destination];
  if (!spots) return [];
  return spots.slice(0, MAX_REGION_SPOTS);
};

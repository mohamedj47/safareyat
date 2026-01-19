
import { Province, Company } from './types';

export const SERVICE_FEE = 5; 
export const VODAFONE_CASH_NUMBER = "01021953277";

// Blue Bus API Config
export const BLUEBUS_TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5ibHVlYnVzLmNvbS5lZy9ncmFwaHFsIiwiaWF0IjoxNzY4ODE1MTk1LCJleHAiOjc3Njg4MTUxOTUsIm5iZiI6MTc2ODgxNTE5NSwianRpIjoiRUpjckE3SGQwQXB4M1VoYyIsInN1YiI6ODMzMTUwLCJwcnYiOiIxZDBhMDIwYWNmNWM0YjZjNDk3OTg5ZGYxYWJmMGZiZDRlOGM4ZDYzIiwicGhvbmUiOiIwMTIyMTc0NjU1NCJ9.ssZIJ8puXegceIagHst1QUJglACinMGxPxdhvTTo8";

export const CITY_MAP_BLUEBUS: Record<string, number> = {
  'القاهرة': 1, 'الإسكندرية': 2, 'الغردقة': 3, 'شرم الشيخ': 4, 'بورسعيد': 5, 'مرسى مطروح': 6, 'الأقصر': 7, 'أسوان': 8, 'المنصورة': 9
};

export const PROVINCES: Province[] = [
  { id: '19', name: 'القاهرة', stations: [{ id: '1', name: 'ألماظة' }, { id: '4', name: 'عبد المنعم رياض' }] },
  { id: '20', name: 'الإسكندرية', stations: [{ id: '7', name: 'محرم بك' }, { id: '20', name: 'ميامي' }] },
  { id: '24', name: 'الغردقة', stations: [{ id: '18', name: 'الدهار' }] },
  { id: '25', name: 'شرم الشيخ', stations: [{ id: '19', name: 'الرويسات' }] },
  { id: '23', name: 'بورسعيد', stations: [{ id: '16', name: 'الموقف الجديد' }] },
  { id: '107', name: 'المنصورة', stations: [{ id: '50', name: 'المنصورة' }] },
  { id: '22', name: 'مرسى مطروح', stations: [{ id: '17', name: 'مطروح' }] },
  { id: '26', name: 'الأقصر', stations: [{ id: '21', name: 'الأقصر' }] },
  { id: '36', name: 'أسوان', stations: [{ id: '25', name: 'أسوان' }] }
];

export const INITIAL_COMPANIES: Company[] = [
  { id: 'c5', name: 'بلو باص', logo: 'https://bluebus.com.eg/Content/img/logo.png', isActive: true, provinces: ['القاهرة', 'الإسكندرية', 'الغردقة', 'الأقصر'] },
  { id: 'c1', name: 'جو باص', logo: 'https://seeklogo.com/images/G/go-bus-logo-30A5F90B2D-seeklogo.com.png', isActive: true, provinces: ['القاهرة', 'الإسكندرية', 'الغردقة', 'شرم الشيخ'] },
  { id: 'c2', name: 'سوبر جيت', logo: 'https://superjet.com.eg/images/logo.png', isActive: true, provinces: ['القاهرة', 'الإسكندرية', 'الغردقة', 'بورسعيد'] },
  { id: 'c3', name: 'وي باص', logo: 'https://webus.com.eg/wp-content/uploads/2021/08/cropped-logo-1.png', isActive: true, provinces: ['القاهرة', 'الإسكندرية', 'الغردقة'] },
  { id: 'c4', name: 'هاي جيت', logo: 'https://highjet.com.eg/img/logo.png', isActive: true, provinces: ['القاهرة', 'الغردقة', 'الأقصر'] }
];

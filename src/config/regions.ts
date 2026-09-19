export interface RegionData {
  id: string;
  name: string;
}

export interface CityData {
  id: string;
  name: string;
  districts: RegionData[];
}

export const OMSK_REGION_DATA: CityData[] = [
  {
    id: 'omsk-city',
    name: 'Омск',
    districts: [
      { id: 'central', name: 'Центральный' },
      { id: 'soviet', name: 'Советский' },
      { id: 'kirov', name: 'Кировский' },
      { id: 'october', name: 'Октябрьский' },
      { id: 'lenin', name: 'Ленинский' },
    ],
  },
  {
    id: 'omsk-oblast',
    name: 'Омская область',
    districts: [
      { id: 'azov', name: 'Азовский' },
      { id: 'bolsherechye', name: 'Большереченский' },
      { id: 'bolsheuki', name: 'Большеуковский' },
      { id: 'gorkovskoe', name: 'Горьковский' },
      { id: 'isilkul', name: 'Исилькульский' },
      { id: 'kalachinsk', name: 'Калачинский' },
      { id: 'kolosovka', name: 'Колосовский' },
      { id: 'kormilovka', name: 'Кормиловский' },
      { id: 'krutinka', name: 'Крутинский' },
      { id: 'lyubino', name: 'Любинский' },
      { id: 'maryanovka', name: 'Марьяновский' },
      { id: 'muromtsevo', name: 'Муромцевский' },
      { id: 'nazyvaevsk', name: 'Называевский' },
      { id: 'nizhneomskoe', name: 'Нижнеомский' },
      { id: 'novovarshavka', name: 'Нововаршавский' },
      { id: 'odesskoe', name: 'Одесский' },
      { id: 'okoneshnikovo', name: 'Оконешниковский' },
      { id: 'omsky-district', name: 'Омский' },
      { id: 'pavlogradka', name: 'Павлоградский' },
      { id: 'poltavka', name: 'Полтавский' },
      { id: 'russkaya-polyana', name: 'Русско-Полянский' },
      { id: 'sargatskoe', name: 'Саргатский' },
      { id: 'sedelnikovo', name: 'Седельниковский' },
      { id: 'tavricheskoe', name: 'Таврический' },
      { id: 'tevriz', name: 'Тевризский' },
      { id: 'tyukalinsk', name: 'Тюкалинский' },
      { id: 'ust-ishim', name: 'Усть-Ишимский' },
      { id: 'cherlak', name: 'Черлакский' },
      { id: 'sherbakul', name: 'Шербакульский' },
      { id: 'znamenskoe', name: 'Знаменский' },
    ],
  },
];

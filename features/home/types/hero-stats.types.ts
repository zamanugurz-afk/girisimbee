export type HeroStatsCounts = {
  total: number;
  jobs: number;
  partners: number;
  franchise: number;
  services: number;
  opportunities: number;
  solutions: number;
};

export type HeroStatKey = keyof HeroStatsCounts;

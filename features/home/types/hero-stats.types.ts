export type HeroStatsCounts = {
  total: number;
  entrepreneurs: number;
  investors: number;
  jobs: number;
  partners: number;
  franchise: number;
};

export type HeroStatKey = keyof HeroStatsCounts;

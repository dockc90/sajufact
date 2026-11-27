declare module "lunar-javascript" {
  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
  }

  export class Lunar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour?: number,
      minute?: number,
      second?: number
    ): Lunar;
    getEightChar(): EightChar;
    getSolar(): Solar;
  }

  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour?: number,
      minute?: number,
      second?: number
    ): Solar;
    getLunar(): Lunar;
  }
}

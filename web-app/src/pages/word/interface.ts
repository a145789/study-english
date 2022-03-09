export type WordType = {
  _id: string;
  word: string;
  /** 美式发音 */
  americanPhonetic: string;
  /** 英式发音 */
  britishPhonetic: string;
  /** 例句 */
  sampleSentences: { en: string; cn: string; _id: string }[];
  /** 翻译1 */
  translation_1: string;
  /** 翻译2 */
  translation_2: string;
  /** 关联词 */
  association: { word: string; translation: string; _id: string }[];
};

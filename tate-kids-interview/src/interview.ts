// Edit decision list for the parent interview (script block 1:15–2:20).
// All times are seconds in the source clip. Cut points were placed in
// pauses found from a word-level transcript plus audio loudness.

export type Subtitle = {
  from: number;
  to: number;
  text: string;
};

export type Shot = {
  clip: string;
  from: number;
  to: number;
  subtitles: Subtitle[];
};

export type Block = {
  id: string;
  question: string;
  location: "window" | "kitchen";
  shots: Shot[];
};

export const BLOCKS: Block[] = [
  {
    id: "Q1",
    question: "Сколько лет вашему ребёнку?",
    location: "window",
    shots: [
      {
        clip: "12-19-01",
        from: 6.62,
        to: 12.85,
        subtitles: [
          { from: 6.62, to: 8.2, text: "У меня сын." },
          { from: 8.2, to: 12.85, text: "Его зовут Никита, ему восемь лет." },
        ],
      },
    ],
  },
  {
    id: "Q2",
    question: "Нравится ли ему Tate\u00A0Kids?",
    location: "window",
    shots: [
      {
        clip: "12-19-45",
        from: 4.5,
        to: 17.3,
        subtitles: [
          { from: 4.5, to: 7.4, text: "Да, думаю, ему нравится," },
          {
            from: 7.4,
            to: 11.6,
            text: "потому что он довольно часто заходит на этот канал",
          },
          { from: 11.6, to: 14.5, text: "и смотрит там видео," },
          { from: 14.5, to: 17.3, text: "и ему это очень интересно." },
        ],
      },
    ],
  },
  {
    id: "Q3",
    question: "Как вы узнали про Tate\u00A0Kids?",
    location: "kitchen",
    shots: [
      {
        clip: "12-20-01",
        from: 9.6,
        to: 22.2,
        subtitles: [
          {
            from: 9.6,
            to: 14.9,
            text: "Моя мама посоветовала посмотреть этот канал,",
          },
          {
            from: 14.9,
            to: 22.2,
            text: "ей он показался очень интересным, и мы попробовали.",
          },
        ],
      },
      {
        clip: "12-20-01",
        from: 23.15,
        to: 25.2,
        subtitles: [{ from: 23.15, to: 25.2, text: "И это был приятный опыт." }],
      },
    ],
  },
  {
    id: "Q4",
    question: "Почему Tate\u00A0Kids полезен для детей?",
    location: "kitchen",
    shots: [
      {
        clip: "12-20-17",
        from: 8.8,
        to: 14.65,
        subtitles: [
          {
            from: 8.8,
            to: 14.65,
            text: "Во-первых, здесь можно найти много информации",
          },
        ],
      },
      {
        clip: "12-20-17",
        from: 17.7,
        to: 25.35,
        subtitles: [
          { from: 17.7, to: 20.2, text: "о художниках, о разных художниках," },
          {
            from: 20.2,
            to: 25.35,
            text: "об их прошлом и о том, как они стали художниками.",
          },
        ],
      },
      {
        clip: "12-20-17",
        from: 46.2,
        to: 53.45,
        subtitles: [
          {
            from: 46.2,
            to: 51.8,
            text: "Это очень интересно и хорошо адаптировано для детей,",
          },
          { from: 51.8, to: 53.45, text: "так что это здорово." },
        ],
      },
    ],
  },
  {
    id: "Q5",
    question: "Порекомендовали бы вы Tate\u00A0Kids другим родителям?",
    location: "kitchen",
    shots: [
      {
        clip: "12-20-09",
        from: 5.5,
        to: 14.48,
        subtitles: [
          { from: 5.5, to: 6.9, text: "Да, конечно." },
          { from: 6.9, to: 8.1, text: "— Почему?" },
          {
            from: 8.1,
            to: 14.48,
            text: "Потому что это очень хороший сайт, и он очень полезен для детей.",
          },
        ],
      },
      {
        clip: "12-20-09",
        from: 15.95,
        to: 18.15,
        subtitles: [{ from: 15.95, to: 18.15, text: "Там они могут узнать много" }],
      },
      {
        clip: "12-20-09",
        from: 20.1,
        to: 25.75,
        subtitles: [
          {
            from: 20.1,
            to: 23.5,
            text: "нового о художниках и об искусстве,",
          },
          { from: 23.5, to: 25.75, text: "так что это хорошо." },
        ],
      },
    ],
  },
];

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
    question: "How old is your child?",
    location: "window",
    shots: [
      {
        clip: "12-19-01",
        from: 6.62,
        to: 12.85,
        subtitles: [
          { from: 6.62, to: 8.2, text: "I have a son." },
          { from: 8.2, to: 12.85, text: "His name is Nikita, and he is eight years old." },
        ],
      },
    ],
  },
  {
    id: "Q2",
    question: "Does your child like Tate\u00A0Kids?",
    location: "window",
    shots: [
      {
        clip: "12-19-45",
        from: 4.5,
        to: 17.3,
        subtitles: [
          { from: 4.5, to: 7.4, text: "Yes, I think he likes it," },
          {
            from: 7.4,
            to: 11.6,
            text: "because he quite often looks at this channel",
          },
          { from: 11.6, to: 14.5, text: "and watches some videos from it," },
          { from: 14.5, to: 17.3, text: "and he finds it really interesting." },
        ],
      },
    ],
  },
  {
    id: "Q3",
    question: "How did you find out about Tate\u00A0Kids?",
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
            text: "My mom suggested we look at this channel,",
          },
          {
            from: 14.9,
            to: 22.2,
            text: "because she found it really interesting, and we tried it.",
          },
        ],
      },
      {
        clip: "12-20-01",
        from: 23.15,
        to: 25.2,
        subtitles: [{ from: 23.15, to: 25.2, text: "And it was a nice experience." }],
      },
    ],
  },
  {
    id: "Q4",
    question: "Why is Tate\u00A0Kids good for children?",
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
            text: "At first, we can find a lot of information",
          },
        ],
      },
      {
        clip: "12-20-17",
        from: 17.7,
        to: 25.35,
        subtitles: [
          { from: 17.7, to: 20.2, text: "about artists, different artists," },
          {
            from: 20.2,
            to: 25.35,
            text: "about their past and how they became artists.",
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
            text: "It's very interesting and very adapted for children,",
          },
          { from: 51.8, to: 53.45, text: "so it's nice." },
        ],
      },
    ],
  },
  {
    id: "Q5",
    question: "Would you recommend Tate\u00A0Kids to other parents?",
    location: "kitchen",
    shots: [
      {
        clip: "12-20-09",
        from: 5.5,
        to: 14.48,
        subtitles: [
          { from: 5.5, to: 6.9, text: "Yes, of course." },
          { from: 6.9, to: 8.1, text: "— Why?" },
          {
            from: 8.1,
            to: 14.48,
            text: "Because it's a really good website, and it's very useful for children.",
          },
        ],
      },
      {
        clip: "12-20-09",
        from: 15.95,
        to: 18.15,
        subtitles: [{ from: 15.95, to: 18.15, text: "They can learn a lot of" }],
      },
      {
        clip: "12-20-09",
        from: 20.1,
        to: 25.75,
        subtitles: [
          {
            from: 20.1,
            to: 23.5,
            text: "new, good information about artists and about art,",
          },
          { from: 23.5, to: 25.75, text: "so it's good." },
        ],
      },
    ],
  },
];

// Edit decision list for the parent interview (script block 1:15–2:20).
// All times are seconds in the source clip. Each answer plays as one
// continuous take so the picture never jumps between subtitle cards; the
// only cut inside an answer is Q4, where 21 s of the take are skipped and
// the two parts are joined with a short cross-dissolve.
// A subtitle stays on screen until the next one starts (or the shot ends).

export type Subtitle = {
  from: number;
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
          { from: 6.62, text: "I have a son." },
          { from: 8.2, text: "His name is Nikita, and he is eight years old." },
        ],
      },
    ],
  },
  {
    id: "Q2",
    question: "Does your child like Tate Kids?",
    location: "window",
    shots: [
      {
        clip: "12-19-45",
        from: 4.5,
        to: 17.3,
        subtitles: [
          { from: 4.5, text: "Yes, I think he likes it," },
          { from: 7.4, text: "because he quite often looks at this channel" },
          { from: 11.6, text: "and watches some videos from it," },
          { from: 14.5, text: "and he finds it really interesting." },
        ],
      },
    ],
  },
  {
    id: "Q3",
    question: "How did you find out about Tate Kids?",
    location: "kitchen",
    shots: [
      {
        clip: "12-20-01",
        from: 9.6,
        to: 25.2,
        subtitles: [
          { from: 9.6, text: "My mom suggested we look at this channel," },
          {
            from: 14.9,
            text: "because she found it really interesting, and we tried it.",
          },
          { from: 23.15, text: "And it was a nice experience." },
        ],
      },
    ],
  },
  {
    id: "Q4",
    question: "Why is Tate Kids good for children?",
    location: "kitchen",
    shots: [
      {
        clip: "12-20-17",
        from: 8.8,
        to: 25.35,
        subtitles: [
          { from: 8.8, text: "At first, we can find a lot of information" },
          { from: 17.7, text: "about artists, different artists," },
          {
            from: 20.2,
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
            text: "It's very interesting and very adapted for children,",
          },
          { from: 51.8, text: "so it's nice." },
        ],
      },
    ],
  },
  {
    id: "Q5",
    question: "Would you recommend Tate Kids to other parents?",
    location: "kitchen",
    shots: [
      {
        clip: "12-20-09",
        from: 5.5,
        to: 25.75,
        subtitles: [
          { from: 5.5, text: "Yes, of course." },
          { from: 6.9, text: "— Why?" },
          {
            from: 8.1,
            text: "Because it's a really good website, and it's very useful for children.",
          },
          {
            from: 15.95,
            text: "They can learn a lot of new, good information about artists and about art,",
          },
          { from: 23.5, text: "so it's good." },
        ],
      },
    ],
  },
];

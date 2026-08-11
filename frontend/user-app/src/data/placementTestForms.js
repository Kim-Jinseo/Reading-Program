const question = (level, q, options, answer) => ({ level, q, options, answer });
const speaking = (level, target) => ({ level, target });

const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const shuffleChoices = (items) => {
  // Spread the correct answers across A, B, and C on every test attempt.
  // This keeps answer order fair while avoiding a repeated answer-letter pattern.
  const answerPositions = shuffle(items.map((_, index) => index % 3));

  return items.map((item, index) => {
    const choicesWithoutAnswer = shuffle(item.options.filter(option => option !== item.answer));
    choicesWithoutAnswer.splice(answerPositions[index], 0, item.answer);
    return { ...item, options: choicesWithoutAnswer };
  });
};

// These forms are purpose-written for placement. They are kept separate from
// the lesson curriculum so a placement attempt never reuses practice content.
export const PLACEMENT_TEST_FORMS = [
  {
    id: 'garden-seeds',
    reading: {
      passage: 'On Saturday, Lina took three bean seeds to the school garden. She put the seeds in a small bed near the gate. Her friend Bo carried a can of water. After they finished, Lina wrote the date on a wooden sign.',
      questions: [
        question(1, 'Who took the bean seeds to the garden?', ['Lina', 'Bo', 'The teacher'], 'Lina'),
        question(2, 'Where did Lina put the seeds?', ['Near the gate', 'Under a desk', 'By the bus stop'], 'Near the gate'),
        question(3, 'What did Lina write on the sign?', ['The date', 'A song', 'Her lunch'], 'The date')
      ]
    },
    vocab: [
      question(1, "What is a 'puddle'?", ['A small pool of water', 'A kind of bird', 'A school bag'], 'A small pool of water'),
      question(1, "What is a 'path'?", ['A small road to walk on', 'A loud sound', 'A sweet drink'], 'A small road to walk on'),
      question(2, "What does 'borrow' mean?", ['Use something and give it back later', 'Throw something away', 'Make something smaller'], 'Use something and give it back later'),
      question(2, "What does 'arrive' mean?", ['Get to a place', 'Go to sleep', 'Draw a picture'], 'Get to a place'),
      question(3, "What does 'protect' mean?", ['Keep safe', 'Make noisy', 'Move quickly'], 'Keep safe')
    ],
    grammar: [
      question(1, 'The rabbit ___ two long ears.', ['has', 'have', 'having'], 'has'),
      question(2, 'Look! We ___ a paper boat now.', ['are making', 'make', 'made'], 'are making'),
      question(3, 'You can choose either milk ___ tea.', ['or', 'and', 'but'], 'or')
    ],
    speaking: [
      speaking(1, 'I see a small red kite.'),
      speaking(2, 'My sister is reading a book.'),
      speaking(3, 'I would like to visit the library.')
    ]
  },
  {
    id: 'market-bread',
    reading: {
      passage: 'Early on Tuesday, Jun went to the market with his grandfather. They bought warm bread, eggs, and two oranges. A woman at the fruit stand gave Jun a paper bag. At home, Jun put the oranges in a blue bowl for his family.',
      questions: [
        question(1, 'Who went to the market with Jun?', ['His grandfather', 'His sister', 'His teacher'], 'His grandfather'),
        question(2, 'When did Jun go to the market?', ['Early on Tuesday', 'At night on Friday', 'After school on Monday'], 'Early on Tuesday'),
        question(3, 'Where did Jun put the oranges?', ['In a blue bowl', 'Under his bed', 'On the bus'], 'In a blue bowl')
      ]
    },
    vocab: [
      question(1, "What is a 'basket'?", ['A container for carrying things', 'A place to sleep', 'A type of tree'], 'A container for carrying things'),
      question(1, "What is a 'bridge'?", ['A road built over water or a road', 'A small animal', 'A school subject'], 'A road built over water or a road'),
      question(2, "What does 'whisper' mean?", ['Speak very quietly', 'Run very fast', 'Eat a big meal'], 'Speak very quietly'),
      question(2, "What does 'collect' mean?", ['Bring things together', 'Break something', 'Leave a place'], 'Bring things together'),
      question(3, "What does 'improve' mean?", ['Make something better', 'Make something shorter', 'Put something away'], 'Make something better')
    ],
    grammar: [
      question(1, 'There ___ three ducks in the pond.', ['are', 'is', 'am'], 'are'),
      question(2, '___ you visit your cousin last weekend?', ['Did', 'Do', 'Does'], 'Did'),
      question(3, 'Both the lamp ___ the fan are on.', ['and', 'or', 'so'], 'and')
    ],
    speaking: [
      speaking(1, 'The sun is warm today.'),
      speaking(2, 'We walked to the market after lunch.'),
      speaking(3, 'Could you show me the way, please?')
    ]
  },
  {
    id: 'rainy-walk',
    reading: {
      passage: 'Rain fell before school on Thursday. Mei wore yellow boots and carried an umbrella. On the path, she saw a small snail beside a leaf. Mei did not touch it. She watched it move slowly until the rain became light.',
      questions: [
        question(1, 'What did Mei carry?', ['An umbrella', 'A basket', 'A drum'], 'An umbrella'),
        question(2, 'Where did Mei see the snail?', ['Beside a leaf', 'In the classroom', 'On the roof'], 'Beside a leaf'),
        question(3, 'When did Mei see the snail?', ['Before school on Thursday', 'At dinner on Sunday', 'After a film on Friday'], 'Before school on Thursday')
      ]
    },
    vocab: [
      question(1, "What is a 'blanket'?", ['A warm cover for a bed', 'A place to buy food', 'A small cup'], 'A warm cover for a bed'),
      question(1, "What is a 'corner'?", ['The place where two sides meet', 'The middle of a lake', 'A type of shoe'], 'The place where two sides meet'),
      question(2, "What does 'invite' mean?", ['Ask someone to come', 'Ask someone to leave', 'Tell someone to be quiet'], 'Ask someone to come'),
      question(2, "What does 'prepare' mean?", ['Get ready for something', 'Forget something', 'Play a game'], 'Get ready for something'),
      question(3, "What does 'repair' mean?", ['Fix something that is broken', 'Make something dirty', 'Hide something'], 'Fix something that is broken')
    ],
    grammar: [
      question(1, 'My shoes ___ by the door.', ['are', 'is', 'am'], 'are'),
      question(2, 'She ___ not call me yesterday.', ["didn't", "doesn't", "don't"], "didn't"),
      question(3, 'When I was little, I ___ play outside every day.', ['used to', 'use to', 'am used to'], 'used to')
    ],
    speaking: [
      speaking(1, 'I have a blue umbrella.'),
      speaking(2, 'The dog is waiting by the door.'),
      speaking(3, 'We used to play near the river.')
    ]
  },
  {
    id: 'bird-house',
    reading: {
      passage: 'Mr. Han brought a small wooden bird house to Class Four. First, the class painted it green. Next, they tied it safely to a tree behind the school. Two days later, Niko saw a sparrow looking into the little house from a branch.',
      questions: [
        question(1, 'Who brought the bird house to Class Four?', ['Mr. Han', 'Niko', 'A sparrow'], 'Mr. Han'),
        question(2, 'What color did the class paint the bird house?', ['Green', 'Purple', 'White'], 'Green'),
        question(3, 'Where did Niko see the sparrow?', ['On a branch', 'Under the school bus', 'In the lunch room'], 'On a branch')
      ]
    },
    vocab: [
      question(1, "What is a 'meadow'?", ['A field with grass and flowers', 'A room with books', 'A small boat'], 'A field with grass and flowers'),
      question(1, "What is a 'shell'?", ['A hard cover on some animals', 'A kind of fruit', 'A school rule'], 'A hard cover on some animals'),
      question(2, "What does 'choose' mean?", ['Pick one thing', 'Copy every word', 'Close a door'], 'Pick one thing'),
      question(2, "What does 'notice' mean?", ['See or become aware of something', 'Make a list', 'Move to a new home'], 'See or become aware of something'),
      question(3, "What does 'reduce' mean?", ['Use or make less', 'Use or make more', 'Put in order'], 'Use or make less')
    ],
    grammar: [
      question(1, '___ is my pencil on the desk.', ['This', 'These', 'Those'], 'This'),
      question(2, 'How ___ water is in the bottle?', ['much', 'many', 'few'], 'much'),
      question(3, 'The box is light ___ for the child to carry.', ['enough', 'too', 'very'], 'enough')
    ],
    speaking: [
      speaking(1, 'This is my new pencil.'),
      speaking(2, 'There were birds in the tree.'),
      speaking(3, 'The bag is light enough to carry.')
    ]
  },
  {
    id: 'school-poster',
    reading: {
      passage: 'On Monday, Rui and his classmates made a poster about saving water. Rui drew a tap and a bucket. Sara wrote, “Turn off the tap after you wash your hands.” At the end of the day, their teacher put the poster next to the classroom door.',
      questions: [
        question(1, 'What did Rui and his classmates make?', ['A poster', 'A cake', 'A bus'], 'A poster'),
        question(2, 'Who wrote the words on the poster?', ['Sara', 'Rui', 'The teacher'], 'Sara'),
        question(3, 'Where did the teacher put the poster?', ['Next to the classroom door', 'Under the tap', 'At the market'], 'Next to the classroom door')
      ]
    },
    vocab: [
      question(1, "What is a 'lantern'?", ['A light inside a cover', 'A very tall tree', 'A small piece of food'], 'A light inside a cover'),
      question(1, "What is a 'village'?", ['A small group of homes', 'A large ocean', 'A kind of game'], 'A small group of homes'),
      question(2, "What does 'promise' mean?", ['Say you will do something', 'Ask for a price', 'Forget a name'], 'Say you will do something'),
      question(2, "What does 'follow' mean?", ['Go after someone or something', 'Stand in front of someone', 'Draw a line'], 'Go after someone or something'),
      question(3, "What does 'explain' mean?", ['Make something clear by telling about it', 'Make something disappear', 'Put something in a bag'], 'Make something clear by telling about it')
    ],
    grammar: [
      question(1, 'The baby ___ asleep now.', ['is', 'are', 'am'], 'is'),
      question(2, 'They ___ football after school every Wednesday.', ['play', 'are playing', 'played'], 'play'),
      question(3, '___ do you visit the library? — Every Friday.', ['How often', 'How long', 'How much'], 'How often')
    ],
    speaking: [
      speaking(1, 'My friend has a yellow bag.'),
      speaking(2, 'We play football every Wednesday.'),
      speaking(3, 'How often do you visit the library?')
    ]
  },
  {
    id: 'night-sky',
    reading: {
      passage: 'After dinner, Tao sat outside with his aunt. They looked at the dark sky and counted bright stars. Tao used a small notebook to draw the moon. Before going inside, his aunt pointed to a group of clouds moving over the hill.',
      questions: [
        question(1, 'Who sat outside with Tao?', ['His aunt', 'His coach', 'His brother'], 'His aunt'),
        question(2, 'What did Tao use to draw the moon?', ['A small notebook', 'A red ball', 'A paper cup'], 'A small notebook'),
        question(3, 'Where were the clouds moving?', ['Over the hill', 'Into the pond', 'Under the table'], 'Over the hill')
      ]
    },
    vocab: [
      question(1, "What is a 'stream'?", ['A small flowing river', 'A large building', 'A new book'], 'A small flowing river'),
      question(1, "What is a 'pebble'?", ['A small smooth stone', 'A warm hat', 'A kind of flower'], 'A small smooth stone'),
      question(2, "What does 'carry' mean?", ['Take something from one place to another', 'Watch something carefully', 'Choose a color'], 'Take something from one place to another'),
      question(2, "What does 'compare' mean?", ['Look at two things to see how they are alike or different', 'Put something in water', 'Ask someone to come'], 'Look at two things to see how they are alike or different'),
      question(3, "What does 'important' mean?", ['Needed or very useful', 'Very noisy', 'Easy to lose'], 'Needed or very useful')
    ],
    grammar: [
      question(1, 'I ___ a student in Grade Five.', ['am', 'is', 'are'], 'am'),
      question(2, 'The children ___ home after the game yesterday.', ['walked', 'walk', 'are walking'], 'walked'),
      question(3, 'The blue kite is not as ___ as the red kite.', ['high', 'higher', 'highest'], 'high')
    ],
    speaking: [
      speaking(1, 'I am happy to be here.'),
      speaking(2, 'The children walked home yesterday.'),
      speaking(3, 'The blue kite is not as high as the red kite.')
    ]
  }
];

export const getPlacementItems = (form) => {
  const multipleChoiceItems = [
    ...form.reading.questions.map(item => ({ ...item, section: 'reading' })),
    ...form.vocab.map(item => ({ ...item, section: 'vocab' })),
    ...form.grammar.map(item => ({ ...item, section: 'grammar' }))
  ];

  return [
    ...shuffleChoices(multipleChoiceItems),
    ...form.speaking.map(item => ({ ...item, section: 'speaking' }))
  ];
};

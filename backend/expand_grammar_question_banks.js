import fs from 'fs';

const FILES = ['backend/curriculum.json', 'frontend/user-app/src/data/curriculum.json'];
const FALLBACK_OPTIONS = ['am', 'is', 'are', 'a', 'an', 'the'];

const unique = values => [...new Set(values.map(value => String(value).trim()).filter(Boolean))];

function question(q, a, distractors) {
  const options = unique([a, ...distractors]).slice(0, 3);
  for (const fallback of FALLBACK_OPTIONS) {
    if (options.length >= 3) break;
    if (fallback !== a && !options.includes(fallback)) options.push(fallback);
  }
  if (options.length !== 3 || !options.includes(a)) {
    throw new Error(`Invalid options for: ${q}`);
  }
  return { q, options, a };
}

function addDifficulty(questions) {
  return questions.map((item, index) => ({ ...item, difficulty: index < 8 ? 1 : index < 16 ? 2 : 3 }));
}

function cycle(values, index) {
  return values[index % values.length];
}

function makeQuestions() {
  const generated = {};

  // Grade 1–2
  generated[201] = (() => {
    const nouns = [
      ['egg', 'an'], ['yellow kite', 'a'], ['igloo', 'an'], ['old hat', 'an'], ['rabbit', 'a'],
      ['orange', 'an'], ['blue cup', 'a'], ['insect', 'an'], ['apple pie', 'an'], ['little boat', 'a'],
      ['umbrella', 'an'], ['green leaf', 'a'], ['octopus', 'an'], ['fun game', 'a'], ['ice cube', 'an'],
      ['small frog', 'a'], ['owl', 'an'], ['empty box', 'an'], ['red pen', 'a'], ['animal', 'an'],
      ['big map', 'a'], ['eraser', 'an'], ['happy baby', 'a']
    ];
    return nouns.map(([noun, answer]) => question(`I see ___ ${noun}.`, answer, [answer === 'a' ? 'an' : 'a', 'some']));
  })();

  generated[202] = (() => {
    const rows = [
      ['Peter', 'He', 'is my cousin.'], ['Amy', 'She', 'has a red bag.'], ['The ball', 'It', 'is on the floor.'],
      ['Mia and Sue', 'They', 'are classmates.'], ['My dad and I', 'We', 'walk home.'], ['The dog', 'It', 'is very small.'],
      ['Ben', 'He', 'can ride a bike.'], ['My sister', 'She', 'likes music.'], ['The book', 'It', 'is new.'],
      ['Tom and I', 'We', 'play after school.'], ['The birds', 'They', 'are in the tree.'], ['My mother', 'She', 'is cooking.'],
      ['The robot', 'It', 'can move.'], ['Jack and Sam', 'They', 'are brothers.'], ['My friends and I', 'We', 'are happy.'],
      ['The baby', 'It', 'is sleeping.'], ['Mr. Li', 'He', 'is our teacher.'], ['Lucy', 'She', 'has a cat.'],
      ['The flowers', 'They', 'are yellow.'], ['My brother and I', 'We', 'share a room.'], ['The sun', 'It', 'is bright.'],
      ['David', 'He', 'reads every day.'], ['The girls', 'They', 'sing well.']
    ];
    return rows.map(([subject, answer, ending]) => question(`Read about ${subject}. ___ ${ending}`, answer, ['He', 'She', 'It', 'We', 'They'].filter(value => value !== answer)));
  })();

  generated[203] = (() => {
    const words = [
      ['toy', 'toys'], ['pen', 'pens'], ['dish', 'dishes'], ['bus', 'buses'], ['fox', 'foxes'], ['box', 'boxes'],
      ['brush', 'brushes'], ['class', 'classes'], ['peach', 'peaches'], ['cup', 'cups'], ['star', 'stars'],
      ['watch', 'watches'], ['glass', 'glasses'], ['baby', 'babies'], ['key', 'keys'], ['potato', 'potatoes'],
      ['tomato', 'tomatoes'], ['chair', 'chairs'], ['beach', 'beaches'], ['dress', 'dresses'], ['book', 'books'],
      ['frog', 'frogs'], ['sandwich', 'sandwiches']
    ];
    return words.map(([singular, plural]) => question(`Choose the correct plural form of “${singular}”.`, plural, [singular, `a ${singular}`]));
  })();

  generated[204] = (() => {
    const rows = [
      ['I', 'am', 'ready for school.'], ['You', 'are', 'my friend.'], ['He', 'is', 'a good runner.'],
      ['She', 'is', 'in the classroom.'], ['It', 'is', 'a sunny day.'], ['We', 'are', 'on the team.'],
      ['They', 'are', 'at the park.'], ['My cat', 'is', 'very soft.'], ['My parents', 'are', 'at home.'],
      ['The apples', 'are', 'red.'], ['The book', 'is', 'on the desk.'], ['My brother', 'is', 'six.'],
      ['My sister and I', 'are', 'busy.'], ['The dogs', 'are', 'fast.'], ['I', 'am', 'happy today.'],
      ['You', 'are', 'kind.'], ['The teacher', 'is', 'here.'], ['The children', 'are', 'quiet.'],
      ['My shoes', 'are', 'new.'], ['The bird', 'is', 'in the tree.'], ['We', 'are', 'good helpers.'],
      ['They', 'are', 'my classmates.'], ['The milk', 'is', 'cold.']
    ];
    return rows.map(([subject, answer, ending]) => question(`${subject} ___ ${ending}`, answer, ['am', 'is', 'are'].filter(value => value !== answer)));
  })();

  generated[205] = (() => {
    const rows = [
      ['near me', 'This', 'cup is full.'], ['far away', 'That', 'mountain is high.'], ['in my hand', 'This', 'coin is small.'],
      ['across the field', 'That', 'cow is eating grass.'], ['on my desk', 'This', 'ruler is mine.'], ['by the road', 'That', 'bus is yellow.'],
      ['right here', 'This', 'flower smells nice.'], ['on the hill', 'That', 'tree is very old.'], ['next to me', 'This', 'chair is empty.'],
      ['in the sky', 'That', 'plane is flying.'], ['in my bag', 'This', 'pencil is sharp.'], ['over there', 'That', 'house has a blue door.'],
      ['close to me', 'This', 'apple is sweet.'], ['far from us', 'That', 'boat is small.'], ['on my lap', 'This', 'book is fun.'],
      ['at the end of the street', 'That', 'shop sells bread.'], ['right beside me', 'This', 'dog is friendly.'],
      ['across the river', 'That', 'bridge is long.'], ['here', 'This', 'hat is warm.'], ['far in the field', 'That', 'horse is brown.'],
      ['in front of me', 'This', 'box is light.'], ['high in the tree', 'That', 'bird is singing.'], ['by my feet', 'This', 'ball is round.']
    ];
    return rows.map(([place, answer, ending]) => question(`The thing is ${place}. ___ ${ending}`, answer, ['This', 'That', 'These'].filter(value => value !== answer)));
  })();

  generated[206] = (() => {
    const rows = [
      ['I', 'my', 'I pack ___ lunch.'], ['you', 'your', 'Please wash ___ hands.'], ['Leo', 'his', 'Leo feeds ___ fish.'],
      ['Emma', 'her', 'Emma likes ___ new bike.'], ['we', 'our', 'We clean ___ room.'], ['they', 'their', 'They bring ___ books.'],
      ['I', 'my', 'I love ___ family.'], ['you', 'your', 'What is ___ favorite food?'], ['the boy', 'his', 'The boy finds ___ cap.'],
      ['the girl', 'her', 'The girl opens ___ gift.'], ['we', 'our', 'We visit ___ teacher.'], ['they', 'their', 'They walk ___ dog.'],
      ['I', 'my', 'I write ___ name.'], ['you', 'your', 'You put on ___ coat.'], ['Ben', 'his', 'Ben kicks ___ ball.'],
      ['Lily', 'her', 'Lily brushes ___ hair.'], ['we', 'our', 'We finish ___ homework.'], ['the children', 'their', 'The children carry ___ bags.'],
      ['I', 'my', 'I close ___ book.'], ['you', 'your', 'You answer ___ question.'], ['Dad', 'his', 'Dad parks ___ car.'],
      ['Mom', 'her', 'Mom makes ___ soup.'], ['we', 'our', 'We share ___ toys.']
    ];
    return rows.map(([, answer, prompt]) => question(`Choose the correct word: ${prompt}`, answer, ['my', 'your', 'his', 'her', 'our', 'their'].filter(value => value !== answer)));
  })();

  generated[207] = (() => {
    const rows = [
      ['I', 'like', 'drawing pictures.'], ['You', 'like', 'blue shoes.'], ['He', 'likes', 'rice.'], ['She', 'likes', 'reading.'],
      ['We', 'like', 'warm soup.'], ['They', 'like', 'soccer.'], ['The cat', 'likes', 'milk.'], ['My friends', 'like', 'games.'],
      ['Tom', 'likes', 'the beach.'], ['My sister', 'likes', 'dancing.'], ['I', 'like', 'bananas.'], ['You', 'like', 'music.'],
      ['The baby', 'likes', 'toys.'], ['The dogs', 'like', 'to run.'], ['Anna', 'likes', 'her doll.'], ['We', 'like', 'our school.'],
      ['My parents', 'like', 'tea.'], ['The bird', 'likes', 'seeds.'], ['I', 'like', 'this story.'], ['He', 'likes', 'his new cap.'],
      ['They', 'like', 'the park.'], ['She', 'likes', 'apples.'], ['You', 'like', 'to sing.']
    ];
    return rows.map(([subject, answer, ending]) => question(`${subject} ___ ${ending}`, answer, ['like', 'likes', 'liking'].filter(value => value !== answer)));
  })();

  generated[208] = (() => {
    const rows = [
      ['I', 'have', 'a new pen.'], ['You', 'have', 'a red coat.'], ['He', 'has', 'a toy train.'], ['She', 'has', 'a little sister.'],
      ['We', 'have', 'art class today.'], ['They', 'have', 'two cats.'], ['The dog', 'has', 'a long tail.'], ['My friends', 'have', 'a map.'],
      ['Tom', 'has', 'a blue bike.'], ['My sister', 'has', 'a doll.'], ['I', 'have', 'a question.'], ['You', 'have', 'a good idea.'],
      ['The bird', 'has', 'small wings.'], ['The boys', 'have', 'a ball.'], ['Anna', 'has', 'a pink bag.'], ['We', 'have', 'a test today.'],
      ['My parents', 'have', 'a car.'], ['The rabbit', 'has', 'long ears.'], ['I', 'have', 'a snack.'], ['He', 'has', 'a kite.'],
      ['They', 'have', 'a garden.'], ['She', 'has', 'a book.'], ['You', 'have', 'a new notebook.']
    ];
    return rows.map(([subject, answer, ending]) => question(`${subject} ___ ${ending}`, answer, ['have', 'has', 'having'].filter(value => value !== answer)));
  })();

  generated[209] = (() => {
    const rows = [
      ['ball', 'big', 'red'], ['kite', 'small', 'blue'], ['cat', 'little', 'white'], ['car', 'large', 'yellow'],
      ['bag', 'new', 'green'], ['flower', 'pretty', 'pink'], ['house', 'big', 'brown'], ['bird', 'small', 'black'],
      ['book', 'old', 'blue'], ['apple', 'round', 'red'], ['boat', 'little', 'yellow'], ['cup', 'small', 'white'],
      ['hat', 'new', 'red'], ['dog', 'big', 'brown'], ['box', 'large', 'green'], ['fish', 'small', 'gold'],
      ['bike', 'new', 'blue'], ['tree', 'tall', 'green'], ['sock', 'little', 'pink'], ['chair', 'old', 'brown'],
      ['pen', 'long', 'black'], ['rabbit', 'small', 'grey'], ['door', 'big', 'red']
    ];
    return rows.map(([noun, size, color]) => {
      const answer = `a ${size} ${color} ${noun}`;
      return question(`Choose the correct phrase for one ${noun}.`, answer, [`a ${color} ${size} ${noun}`, `${size} a ${color} ${noun}`]);
    });
  })();

  generated[210] = (() => {
    const rows = [
      ['We', 'read', 'books after dinner.'], ['Birds', 'fly', 'above the trees.'], ['Fish', 'swim', 'in water.'],
      ['Rabbits', 'hop', 'in the grass.'], ['I', 'draw', 'a picture.'], ['We', 'clap', 'for the song.'],
      ['Children', 'dance', 'at the party.'], ['I', 'write', 'my name.'], ['Dogs', 'run', 'in the park.'],
      ['We', 'sing', 'in music class.'], ['I', 'jump', 'over the line.'], ['They', 'laugh', 'at the joke.'],
      ['We', 'eat', 'lunch at school.'], ['I', 'drink', 'water.'], ['The boys', 'play', 'outside.'],
      ['We', 'listen', 'to the teacher.'], ['I', 'open', 'the door.'], ['They', 'walk', 'home.'],
      ['We', 'help', 'our friend.'], ['I', 'look', 'at the map.'], ['The girls', 'talk', 'quietly.'],
      ['We', 'clean', 'the table.'], ['I', 'sleep', 'at night.']
    ];
    return rows.map(([subject, answer, ending]) => question(`${subject} ___ ${ending}`, answer, ['run', 'running']));
  })();

  generated[211] = (() => {
    const rows = [
      ['The toy is', 'in', 'the box.'], ['The pen is', 'on', 'the desk.'], ['The mouse is', 'under', 'the chair.'],
      ['The fish is', 'in', 'the bowl.'], ['The cup is', 'on', 'the table.'], ['The shoes are', 'under', 'the bed.'],
      ['The milk is', 'in', 'the fridge.'], ['The picture is', 'on', 'the wall.'], ['The cat is', 'under', 'the sofa.'],
      ['The coins are', 'in', 'the bag.'], ['The plate is', 'on', 'the shelf.'], ['The ball is', 'under', 'the desk.'],
      ['The pencils are', 'in', 'the case.'], ['The hat is', 'on', 'the bed.'], ['The dog is', 'under', 'the tree.'],
      ['The orange is', 'in', 'the basket.'], ['The book is', 'on', 'the chair.'], ['The kitten is', 'under', 'the blanket.'],
      ['The flowers are', 'in', 'the vase.'], ['The phone is', 'on', 'the table.'], ['The bag is', 'under', 'the table.'],
      ['The juice is', 'in', 'the cup.'], ['The clock is', 'on', 'the wall.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['in', 'on', 'under'].filter(value => value !== answer)));
  })();

  generated[212] = (() => {
    const rows = [
      ['___ is your birthday?', 'When'], ['___ is your best friend?', 'Who'], ['___ is the library?', 'Where'],
      ['___ is in the box?', 'What'], ['___ do you eat lunch?', 'Where'], ['___ is that woman?', 'Who'],
      ['___ do you get up?', 'When'], ['___ is your favorite animal?', 'What'], ['___ is your school?', 'Where'],
      ['___ is your math teacher?', 'Who'], ['___ do you go to bed?', 'When'], ['___ do you want to drink?', 'What'],
      ['___ is the bus stop?', 'Where'], ['___ is at the door?', 'Who'], ['___ is the holiday?', 'When'],
      ['___ is your phone number?', 'What'], ['___ do you play soccer?', 'Where'], ['___ is your mother?', 'Who'],
      ['___ do you have English class?', 'When'], ['___ is on the table?', 'What'], ['___ is the zoo?', 'Where'],
      ['___ is your brother?', 'Who'], ['___ do you eat breakfast?', 'When']
    ];
    return rows.map(([prompt, answer]) => question(prompt, answer, ['What', 'Who', 'Where', 'When'].filter(value => value !== answer)));
  })();

  generated[213] = (() => {
    const rows = [
      ['A bird', 'can', 'sing.'], ['A fish', 'cannot', 'read a book.'], ['I', 'can', 'tie my shoes.'],
      ['A baby', 'cannot', 'drive a bus.'], ['We', 'can', 'help our teacher.'], ['A rock', 'cannot', 'talk.'],
      ['You', 'can', 'draw a star.'], ['A cat', 'can', 'climb a tree.'], ['A chair', 'cannot', 'run.'],
      ['They', 'can', 'play a game.'], ['A snake', 'cannot', 'write.'], ['I', 'can', 'count to ten.'],
      ['We', 'can', 'clean the room.'], ['A car', 'cannot', 'eat.'], ['She', 'can', 'read English.'],
      ['A pencil', 'cannot', 'sing.'], ['He', 'can', 'kick the ball.'], ['You', 'can', 'ask a question.'],
      ['A tree', 'cannot', 'walk.'], ['They', 'can', 'share toys.'], ['I', 'can', 'wash my hands.'],
      ['A book', 'cannot', 'jump.'], ['We', 'can', 'listen carefully.']
    ];
    return rows.map(([subject, answer, ending]) => question(`${subject} ___ ${ending}`, answer, ['can', 'cannot', "can't"].filter(value => value !== answer)));
  })();

  generated[214] = (() => {
    const rows = [
      ['Choose the correct sentence about a dog.', 'The dog is brown.', 'the dog is brown.', 'The dog is brown?'],
      ['Choose the correct question.', 'Where is my bag?', 'where is my bag?', 'Where is my bag.'],
      ['Choose the correct sentence about Mia.', 'Mia has a cat.', 'mia has a cat.', 'Mia has a cat?'],
      ['Choose the correct question about age.', 'How old are you?', 'how old are you?', 'How old are you.'],
      ['Choose the correct sentence about the sun.', 'The sun is bright.', 'the sun is bright.', 'The sun is bright?'],
      ['Choose the correct question about a name.', 'What is your name?', 'what is your name?', 'What is your name.'],
      ['Choose the correct sentence about school.', 'We go to school.', 'we go to school.', 'We go to school?'],
      ['Choose the correct question about a book.', 'Who has the book?', 'who has the book?', 'Who has the book.'],
      ['Choose the correct sentence about apples.', 'Apples are red.', 'apples are red.', 'Apples are red?'],
      ['Choose the correct question about home.', 'Where is your home?', 'where is your home?', 'Where is your home.'],
      ['Choose the correct sentence about Tom.', 'Tom can swim.', 'tom can swim.', 'Tom can swim?'],
      ['Choose the correct question about food.', 'What do you eat?', 'what do you eat?', 'What do you eat.'],
      ['Choose the correct sentence about rain.', 'It is raining.', 'it is raining.', 'It is raining?'],
      ['Choose the correct question about a teacher.', 'Who is your teacher?', 'who is your teacher?', 'Who is your teacher.'],
      ['Choose the correct sentence about a game.', 'The game is fun.', 'the game is fun.', 'The game is fun?'],
      ['Choose the correct question about time.', 'When is lunch?', 'when is lunch?', 'When is lunch.'],
      ['Choose the correct sentence about a bird.', 'The bird can fly.', 'the bird can fly.', 'The bird can fly?'],
      ['Choose the correct question about color.', 'What color is it?', 'what color is it?', 'What color is it.'],
      ['Choose the correct sentence about a bike.', 'My bike is new.', 'my bike is new.', 'My bike is new?'],
      ['Choose the correct question about a place.', 'Where is the park?', 'where is the park?', 'Where is the park.'],
      ['Choose the correct sentence about friends.', 'They are my friends.', 'they are my friends.', 'They are my friends?'],
      ['Choose the correct question about a person.', 'Who is that?', 'who is that?', 'Who is that.'],
      ['Choose the correct sentence about a ball.', 'The ball is round.', 'the ball is round.', 'The ball is round?']
    ];
    return rows.map(([prompt, answer, ...wrong]) => question(prompt, answer, wrong));
  })();

  generated[215] = (() => {
    const rows = [
      ['___ the window, please.', 'Close', 'Closing', 'Closed'], ['___ your hands before lunch.', 'Wash', 'Washing', 'Washed'],
      ['___ quiet in the hall.', 'Be', 'Being', 'Been'], ['___ your pencil.', 'Find', 'Finding', 'Found'],
      ['___ the door slowly.', 'Open', 'Opening', 'Opened'], ['___ your bag here.', 'Put', 'Putting', 'Puts'],
      ['___ the picture.', 'Look at', 'Looking at', 'Looked at'], ['___ to the line.', 'Walk', 'Walking', 'Walked'],
      ["___ shout in class.", "Don't", "Doesn't", 'Not'], ['___ your name clearly.', 'Say', 'Saying', 'Said'],
      ['___ the book carefully.', 'Read', 'Reading', 'Reads'], ['___ your friend.', 'Help', 'Helping', 'Helped'],
      ['___ your shoes on.', 'Put', 'Putting', 'Puts'], ['___ the ball to me.', 'Throw', 'Throwing', 'Threw'],
      ["___ play near the road.", "Don't", "Doesn't", 'Not'], ['___ the answer.', 'Write', 'Writing', 'Wrote'],
      ['___ your chair in.', 'Push', 'Pushing', 'Pushed'], ['___ the lights off.', 'Turn', 'Turning', 'Turned'],
      ['___ to your partner.', 'Talk', 'Talking', 'Talked'], ["___ run inside.", 'Do not', 'Does not', 'Not'],
      ['___ your work.', 'Check', 'Checking', 'Checked'], ['___ the floor clean.', 'Keep', 'Keeping', 'Kept'],
      ['___ your lunchbox.', 'Bring', 'Bringing', 'Brought']
    ];
    return rows.map(([prompt, answer, ...wrong]) => question(prompt, answer, wrong));
  })();

  // Grade 3–4
  generated[301] = (() => {
    const rows = [
      ['I am', 'writing', 'a postcard now.'], ['She is', 'washing', 'the dishes.'], ['We are', 'watching', 'a film.'],
      ['The baby is', 'crying', 'right now.'], ['They are', 'making', 'a kite.'], ['He is', 'riding', 'his bike.'],
      ['The cat is', 'drinking', 'milk.'], ['You are', 'wearing', 'a blue coat.'], ['The boys are', 'running', 'home.'],
      ['My mom is', 'talking', 'on the phone.'], ['I am', 'learning', 'a song.'], ['The girls are', 'drawing', 'flowers.'],
      ['Dad is', 'fixing', 'the chair.'], ['We are', 'having', 'lunch.'], ['The teacher is', 'helping', 'us.'],
      ['It is', 'raining', 'outside.'], ['The ducks are', 'swimming', 'in the pond.'], ['I am', 'waiting', 'for the bus.'],
      ['She is', 'cleaning', 'her room.'], ['They are', 'eating', 'breakfast.'], ['The dog is', 'sleeping', 'by the door.'],
      ['We are', 'practicing', 'English.'], ['He is', 'opening', 'the gate.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['run', 'runs']));
  })();

  generated[302] = (() => {
    const rows = [
      ['Yesterday, we', 'cleaned', 'the classroom.'], ['Last night, I', 'painted', 'a picture.'], ['She', 'jumped', 'high yesterday.'],
      ['They', 'helped', 'their teacher this morning.'], ['He', 'looked', 'at the map yesterday.'], ['We', 'talked', 'after class.'],
      ['Mom', 'cooked', 'noodles last night.'], ['I', 'played', 'chess yesterday.'], ['The children', 'danced', 'at the show.'],
      ['My dad', 'washed', 'the car on Sunday.'], ['She', 'visited', 'the museum last week.'], ['We', 'watched', 'a movie yesterday.'],
      ['He', 'worked', 'in the garden yesterday.'], ['They', 'closed', 'the door before bed.'], ['I', 'started', 'my homework at six.'],
      ['The rain', 'ended', 'an hour ago.'], ['We', 'walked', 'to school yesterday.'], ['She', 'called', 'her friend last night.'],
      ['The baby', 'smiled', 'at me.'], ['Dad', 'opened', 'the window.'], ['I', 'needed', 'help yesterday.'],
      ['They', 'climbed', 'the hill on Saturday.'], ['We', 'listened', 'to music last night.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['walk', 'walking']));
  })();

  generated[303] = (() => {
    const rows = [
      ['Yesterday, I', 'went', 'to the library.'], ['She', 'ate', 'an orange this morning.'], ['We', 'saw', 'a rainbow after the rain.'],
      ['He', 'gave', 'me a card yesterday.'], ['They', 'came', 'to my house last weekend.'], ['I', 'got', 'a new pencil yesterday.'],
      ['The dog', 'ran', 'across the field.'], ['Mom', 'made', 'rice for dinner.'], ['We', 'took', 'the bus yesterday.'],
      ['She', 'wrote', 'a letter last night.'], ['He', 'broke', 'his old toy.'], ['I', 'found', 'my key yesterday.'],
      ['They', 'drank', 'tea after lunch.'], ['The bird', 'flew', 'over the lake.'], ['We', 'had', 'a great time.'],
      ['She', 'told', 'a funny story.'], ['He', 'drove', 'to the shop yesterday.'], ['I', 'felt', 'happy yesterday.'],
      ['They', 'built', 'a sandcastle.'], ['We', 'met', 'our teacher in town.'], ['She', 'sang', 'at the party.'],
      ['He', 'fell', 'off his bike.'], ['I', 'thought', 'about the answer.']
    ];
    const base = { went: 'go', ate: 'eat', saw: 'see', gave: 'give', came: 'come', got: 'get', ran: 'run', made: 'make', took: 'take', wrote: 'write', broke: 'break', found: 'find', drank: 'drink', flew: 'fly', had: 'have', told: 'tell', drove: 'drive', felt: 'feel', built: 'build', met: 'meet', sang: 'sing', fell: 'fall', thought: 'think' };
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, [base[answer], `${base[answer]}ing`]));
  })();

  generated[304] = (() => {
    const rows = [
      ['I', 'was', 'reading at seven.'], ['You', 'were', 'waiting for the bus.'], ['He', 'was', 'doing homework.'],
      ['She', 'was', 'making soup.'], ['It', 'was', 'raining yesterday.'], ['We', 'were', 'playing chess.'],
      ['They', 'were', 'watching TV.'], ['The dog', 'was', 'sleeping.'], ['The cats', 'were', 'chasing a ball.'],
      ['My sister', 'was', 'singing.'], ['My friends', 'were', 'laughing.'], ['I', 'was', 'walking home.'],
      ['You', 'were', 'wearing a hat.'], ['The boy', 'was', 'drawing.'], ['The girls', 'were', 'dancing.'],
      ['The bird', 'was', 'flying.'], ['The children', 'were', 'eating lunch.'], ['Mom', 'was', 'cooking.'],
      ['Dad and I', 'were', 'talking.'], ['The book', 'was', 'on the desk.'], ['The pencils', 'were', 'in the box.'],
      ['He', 'was', 'running fast.'], ['We', 'were', 'studying English.']
    ];
    return rows.map(([subject, answer, ending]) => question(`${subject} ___ ${ending}`, answer, ['was', 'were', 'is'].filter(value => value !== answer)));
  })();

  generated[305] = (() => {
    const rows = [
      ['A rabbit is', 'smaller', 'than a horse.'], ['A train is', 'longer', 'than a car.'], ['Winter is', 'colder', 'than spring.'],
      ['My bag is', 'heavier', 'than yours.'], ['This road is', 'wider', 'than that path.'], ['A tiger is', 'stronger', 'than a cat.'],
      ['Autumn is', 'cooler', 'than summer.'], ['My brother is', 'younger', 'than me.'], ['This book is', 'more exciting', 'than that book.'],
      ['A bus is', 'more comfortable', 'than a bike.'], ['This puzzle is', 'more difficult', 'than the last one.'],
      ['The blue cup is', 'cleaner', 'than the red cup.'], ['My new shoes are', 'better', 'than my old shoes.'],
      ['The river is', 'deeper', 'than the pond.'], ['A plane is', 'faster', 'than a bus.'], ['This box is', 'lighter', 'than that box.'],
      ['The yellow flower is', 'more beautiful', 'than the white flower.'], ['My room is', 'tidier', 'than before.'],
      ['This chair is', 'softer', 'than that one.'], ['A whale is', 'bigger', 'than a dolphin.'],
      ['This story is', 'more interesting', 'than the film.'], ['The green line is', 'shorter', 'than the blue line.'], ['My tea is', 'hotter', 'than yours.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['big', 'biggest']));
  })();

  generated[306] = (() => {
    const rows = [
      ['This is the', 'smallest', 'box in the set.'], ['July is the', 'warmest', 'month here.'], ['The cheetah is the', 'fastest', 'land animal.'],
      ['This is the', 'most exciting', 'game in the shop.'], ['That is the', 'most beautiful', 'picture in the room.'],
      ['This is the', 'highest', 'hill in our village.'], ['Sunday is my', 'favorite', 'day of the week.'],
      ['He is the', 'youngest', 'child in the family.'], ['This is the', 'easiest', 'question on the page.'],
      ['That is the', 'longest', 'river in the country.'], ['This is the', 'most useful', 'tool in the box.'],
      ['Winter is the', 'coldest', 'season of the year.'], ['She is the', 'kindest', 'person I know.'],
      ['This is the', 'most interesting', 'book in the library.'], ['The blue whale is the', 'largest', 'animal in the sea.'],
      ['Today is the', 'hottest', 'day this week.'], ['That is the', 'best', 'answer.'], ['This is the', 'worst', 'road in town.'],
      ['The rabbit is the', 'quietest', 'animal in the room.'], ['This is the', 'most difficult', 'part of the test.'],
      ['He is the', 'tallest', 'boy in the class.'], ['This is the', 'shortest', 'way home.'], ['It is the', 'most important', 'rule.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['big', 'bigger']));
  })();

  generated[307] = (() => {
    const rows = [
      ['Please wait for', 'me', 'at the gate.'], ['I can see', 'him', 'in the park.'], ['We called', 'her', 'after school.'],
      ['The teacher praised', 'us', 'today.'], ['Can you hear', 'them', 'outside?'], ['The dog followed', 'me', 'home.'],
      ['I gave', 'him', 'my old book.'], ['We invited', 'her', 'to lunch.'], ['Dad drove', 'us', 'to school.'],
      ['The children helped', 'them', 'with the boxes.'], ['Please tell', 'me', 'the answer.'], ['I met', 'him', 'at the station.'],
      ['We saw', 'her', 'in the shop.'], ['Our coach chose', 'us', 'for the team.'], ['Can you call', 'them', 'later?'],
      ['The nurse spoke to', 'me', 'kindly.'], ['I thanked', 'him', 'for the gift.'], ['We visited', 'her', 'yesterday.'],
      ['The guide showed', 'us', 'the map.'], ['I know', 'them', 'well.'], ['Please help', 'me', 'carry this.'],
      ['The cat likes', 'him', 'very much.'], ['We heard', 'her', 'sing.']
    ];
    const incorrect = { me: ['I', 'my'], him: ['he', 'his'], her: ['she', 'hers'], us: ['we', 'our'], them: ['they', 'their'] };
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, incorrect[answer]));
  })();

  generated[308] = (() => {
    const rows = [
      ['This notebook is', 'mine', '.'], ['That bike is', 'yours', '.'], ['The brown coat is', 'his', '.'],
      ['The pink bag is', 'hers', '.'], ['The classroom is', 'ours', '.'], ['The toys are', 'theirs', '.'],
      ['The blue pen is', 'mine', '.'], ['Is this seat', 'yours', '?'], ['The dog is', 'his', '.'],
      ['The garden is', 'hers', '.'], ['The project is', 'ours', '.'], ['The new house is', 'theirs', '.'],
      ['This hat is', 'mine', '.'], ['That umbrella is', 'yours', '.'], ['The red car is', 'his', '.'],
      ['The book on the desk is', 'hers', '.'], ['The idea was', 'ours', '.'], ['The last cookies are', 'theirs', '.'],
      ['This room is', 'mine', '.'], ['The yellow pencil is', 'yours', '.'], ['That ball is', 'his', '.'],
      ['The small cat is', 'hers', '.'], ['The win is', 'ours', '.']
    ];
    const incorrect = { mine: ['my', 'me'], yours: ['your', 'you'], his: ['he', 'him'], hers: ['her', 'she'], ours: ['our', 'us'], theirs: ['their', 'them'] };
    return rows.map(([start, answer, end]) => question(`${start} ___${end}`, answer, incorrect[answer]));
  })();

  generated[309] = (() => {
    const rows = [
      ['always', 'She always walks to school.', 'She walks always to school.', 'She is always walk to school.'],
      ['usually', 'We usually eat breakfast at home.', 'We eat usually breakfast at home.', 'We are usually eat breakfast at home.'],
      ['often', 'They often play after class.', 'They play often after class.', 'They are often play after class.'],
      ['sometimes', 'I sometimes read before bed.', 'I read sometimes before bed.', 'I am sometimes read before bed.'],
      ['never', 'He never drinks coffee.', 'He drinks never coffee.', 'He is never drink coffee.'],
      ['always', 'The dog always waits by the door.', 'The dog waits always by the door.', 'The dog is always wait by the door.'],
      ['usually', 'My dad usually drives to work.', 'My dad drives usually to work.', 'My dad is usually drive to work.'],
      ['often', 'We often visit Grandma.', 'We visit often Grandma.', 'We are often visit Grandma.'],
      ['sometimes', 'She sometimes sings in the shower.', 'She sings sometimes in the shower.', 'She is sometimes sing in the shower.'],
      ['never', 'I never forget my keys.', 'I forget never my keys.', 'I am never forget my keys.'],
      ['always', 'They are always helpful.', 'They always are helpful.', 'They are helpful always.'],
      ['usually', 'He is usually early.', 'He usually is early.', 'He is early usually.'],
      ['often', 'We are often busy.', 'We often are busy.', 'We are busy often.'],
      ['sometimes', 'The weather is sometimes cold.', 'The weather sometimes is cold.', 'The weather is cold sometimes.'],
      ['never', 'She is never late.', 'She never is late.', 'She is late never.'],
      ['always', 'I always check my work.', 'I check always my work.', 'I am always check my work.'],
      ['usually', 'You usually take the bus.', 'You take usually the bus.', 'You are usually take the bus.'],
      ['often', 'The children often laugh.', 'The children laugh often.', 'The children are often laugh.'],
      ['sometimes', 'We sometimes cook noodles.', 'We cook sometimes noodles.', 'We are sometimes cook noodles.'],
      ['never', 'He never tells lies.', 'He tells never lies.', 'He is never tell lies.'],
      ['always', 'The classroom is always clean.', 'The classroom always is clean.', 'The classroom is clean always.'],
      ['usually', 'I am usually tired after sports.', 'I usually am tired after sports.', 'I am tired usually after sports.'],
      ['often', 'They are often happy.', 'They often are happy.', 'They are happy often.']
    ];
    return rows.map(([word, answer, ...wrong], index) => question(`Choose the correct sentence with “${word}” (example ${index + 1}).`, answer, wrong));
  })();

  generated[310] = (() => {
    const rows = [
      ['The bus comes', 'at', 'seven o’clock.'], ['We have art class', 'on', 'Tuesday.'], ['My birthday is', 'in', 'March.'],
      ['The shop opens', 'at', 'nine.'], ['We play basketball', 'on', 'Saturday.'], ['School starts', 'in', 'September.'],
      ['I go to bed', 'at', 'ten o’clock.'], ['The party is', 'on', 'Friday.'], ['My family visits us', 'in', 'summer.'],
      ['The film begins', 'at', 'six thirty.'], ['We do not study', 'on', 'Sunday.'], ['The Olympics were held', 'in', '2024.'],
      ['Lunch is', 'at', 'twelve.'], ['Her birthday is', 'on', 'May 3rd.'], ['It often rains', 'in', 'April.'],
      ['The train leaves', 'at', '8:15.'], ['We clean the room', 'on', 'Monday.'], ['They moved here', 'in', '2020.'],
      ['The game starts', 'at', 'four.'], ['My cousin was born', 'on', 'Monday.'], ['We travel', 'in', 'August.'],
      ['The class ends', 'at', 'five.'], ['I see my grandparents', 'on', 'the weekend.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['at', 'on', 'in'].filter(value => value !== answer)));
  })();

  generated[311] = (() => {
    const rows = [
      ['How', 'many', 'chairs are there?'], ['How', 'much', 'tea do you want?'], ['There are', 'some', 'oranges in the bag.'],
      ['Do you have', 'any', 'homework today?'], ['How', 'many', 'students are absent?'], ['How', 'much', 'rice is in the bowl?'],
      ['We need', 'some', 'paper for the project.'], ['Is there', 'any', 'juice left?'], ['How', 'many', 'eggs do we need?'],
      ['How', 'much', 'time do you have?'], ['I bought', 'some', 'bread.'], ['Are there', 'any', 'pens on the desk?'],
      ['How', 'many', 'books did you read?'], ['How', 'much', 'milk is in the cup?'], ['She has', 'some', 'friends here.'],
      ['Do we have', 'any', 'sugar?'], ['How', 'many', 'windows are open?'], ['How', 'much', 'money is enough?'],
      ['They need', 'some', 'help.'], ['Are there', 'any', 'questions?'], ['How', 'many', 'dogs are in the park?'],
      ['How', 'much', 'water should I drink?'], ['I have', 'some', 'good news.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['many', 'much', 'some', 'any'].filter(value => value !== answer)));
  })();

  generated[312] = (() => {
    const rows = [
      ['I promise I', 'will', 'call you tonight.'], ['We have a plan. We are', 'going', 'to clean the park.'],
      ['I think it', 'will', 'be cold tomorrow.'], ['She has bought tickets. She is', 'going', 'to see the show.'],
      ['I', 'will', 'carry that box for you.'], ['They have a plan. They are', 'going', 'to visit their uncle.'],
      ['Maybe our team', 'will', 'win.'], ['He has saved money. He is', 'going', 'to buy a bike.'],
      ['Do not worry. We', 'will', 'wait for you.'], ['Look at those clouds! It is', 'going', 'to snow.'],
      ['I am sure you', 'will', 'do well.'], ['She has packed. She is', 'going', 'to travel tomorrow.'],
      ['I', 'will', 'open the door.'], ['We have made a list. We are', 'going', 'to cook dinner.'],
      ['I think Dad', 'will', 'be home soon.'], ['They have booked a room. They are', 'going', 'to stay in a hotel.'],
      ['I', 'will', 'help you now.'], ['The baby is tired. He is', 'going', 'to sleep soon.'],
      ['Perhaps it', 'will', 'rain later.'], ['She has a plan. She is', 'going', 'to learn French.'],
      ['I', 'will', 'get you some water.'], ['We have decided. We are', 'going', 'to start at eight.'],
      ['I think the bus', 'will', 'arrive soon.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['will', 'going', 'went'].filter(value => value !== answer)));
  })();

  generated[313] = (() => {
    const rows = [
      ['I have a pen', 'and', 'a pencil.'], ['He is small', 'but', 'strong.'], ['We stayed inside', 'because', 'it was raining.'],
      ['Would you like juice', 'or', 'water?'], ['She was tired,', 'so', 'she went to bed.'], ['Tom sings', 'and', 'dances.'],
      ['The dog is friendly', 'but', 'very loud.'], ['I wore a coat', 'because', 'it was cold.'], ['Do you want tea', 'or', 'milk?'],
      ['It was late,', 'so', 'we took a taxi.'], ['He has a cat', 'and', 'a rabbit.'], ['The soup is hot', 'but', 'good.'],
      ['We smiled', 'because', 'the joke was funny.'], ['Take the bus', 'or', 'walk home.'], ['She studied hard,', 'so', 'she passed.'],
      ['My sister reads', 'and', 'writes.'], ['The room is small', 'but', 'clean.'], ['I was hungry', 'because', 'I missed lunch.'],
      ['Is it red', 'or', 'blue?'], ['The road was wet,', 'so', 'we walked slowly.'], ['Dad cooks', 'and', 'cleans.'],
      ['It is old', 'but', 'useful.'], ['They cheered', 'because', 'their team won.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['and', 'but', 'or', 'because', 'so'].filter(value => value !== answer)));
  })();

  generated[314] = (() => {
    const rows = [
      ['You', 'must', 'wear a seat belt.'], ['You', 'should', 'drink more water.'], ['Students', 'must', 'follow school rules.'],
      ['You', 'should', 'rest when you are sick.'], ['We', 'must', 'stop at a red light.'], ['You', 'should', 'be kind to others.'],
      ['Visitors', 'must', 'show a ticket.'], ['You', 'should', 'eat breakfast.'], ['We', 'must', 'keep the lab safe.'],
      ['You', 'should', 'ask for help.'], ['Drivers', 'must', 'not text while driving.'], ['You', 'should', 'take an umbrella today.'],
      ['Players', 'must', 'listen to the referee.'], ['You', 'should', 'read every day.'], ['We', 'must', 'not run near the pool.'],
      ['You', 'should', 'say sorry when wrong.'], ['Everyone', 'must', 'follow the fire drill.'], ['You', 'should', 'keep your room tidy.'],
      ['We', 'must', 'protect animals.'], ['You', 'should', 'sleep early tonight.'], ['People', 'must', 'not litter.'],
      ['You', 'should', 'share with friends.'], ['We', 'must', 'be quiet in the library.']
    ];
    return rows.map(([subject, answer, end]) => question(`${subject} ___ ${end}`, answer, ['must', 'should', 'may'].filter(value => value !== answer)));
  })();

  generated[315] = (() => {
    const rows = [
      ['I taught', 'myself', 'to draw.'], ['You can help', 'yourself', 'to some fruit.'], ['He hurt', 'himself', 'while running.'],
      ['She made', 'herself', 'a sandwich.'], ['The bird cleaned', 'itself', '.'], ['We enjoyed', 'ourselves', 'at the picnic.'],
      ['They introduced', 'themselves', 'to the class.'], ['I looked at', 'myself', 'in the mirror.'], ['You should believe in', 'yourself', '.'],
      ['He bought', 'himself', 'a new coat.'], ['She saw', 'herself', 'on TV.'], ['The robot turned', 'itself', 'off.'],
      ['We made', 'ourselves', 'some tea.'], ['They prepared', 'themselves', 'for the race.'], ['I wrote the note by', 'myself', '.'],
      ['You did it by', 'yourself', '.'], ['He fixed the bike', 'himself', '.'], ['She taught', 'herself', 'English.'],
      ['The cat hid', 'itself', 'under the bed.'], ['We cleaned the room by', 'ourselves', '.'], ['They built it by', 'themselves', '.'],
      ['I made the cake', 'myself', '.'], ['You must look after', 'yourself', '.']
    ];
    const incorrect = { myself: ['me', 'my'], yourself: ['you', 'your'], himself: ['him', 'his'], herself: ['her', 'hers'], itself: ['it', 'its'], ourselves: ['us', 'our'], themselves: ['them', 'their'] };
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, incorrect[answer]));
  })();

  // Grade 5–6
  generated[501] = (() => {
    const rows = [
      ['I', 'have', 'seen that film before.'], ['You', 'have', 'finished the task.'], ['He', 'has', 'visited Xi’an twice.'],
      ['She', 'has', 'lost her glasses.'], ['We', 'have', 'lived here for years.'], ['They', 'have', 'already eaten.'],
      ['My brother', 'has', 'cleaned his room.'], ['The students', 'have', 'started the project.'], ['I', 'have', 'never tried skiing.'],
      ['She', 'has', 'just arrived.'], ['We', 'have', 'known them since 2020.'], ['They', 'have', 'won the match.'],
      ['Dad', 'has', 'fixed the bike.'], ['My friends', 'have', 'read this book.'], ['I', 'have', 'already called Mom.'],
      ['He', 'has', 'written a report.'], ['You', 'have', 'made a good choice.'], ['The cat', 'has', 'eaten its food.'],
      ['We', 'have', 'been to the museum.'], ['They', 'have', 'taken the test.'], ['My teacher', 'has', 'given us homework.'],
      ['I', 'have', 'forgotten my password.'], ['She', 'has', 'found her key.']
    ];
    return rows.map(([subject, answer, end]) => question(`${subject} ___ ${end}`, answer, ['have', 'has', 'had'].filter(value => value !== answer)));
  })();

  generated[502] = (() => {
    const rows = [
      ['We have waited', 'for', 'twenty minutes.'], ['I have studied English', 'since', '2019.'], ['She has been away', 'for', 'a week.'],
      ['They have lived here', 'since', 'last summer.'], ['He has played chess', 'for', 'five years.'], ['I have known her', 'since', 'primary school.'],
      ['The shop has been open', 'for', 'three hours.'], ['We have had this dog', 'since', '2021.'], ['She has been busy', 'for', 'two days.'],
      ['I have not eaten', 'since', 'breakfast.'], ['They have practiced', 'for', 'an hour.'], ['He has worked here', 'since', 'June.'],
      ['We have been friends', 'for', 'a long time.'], ['I have felt tired', 'since', 'this morning.'], ['She has waited', 'for', 'ten minutes.'],
      ['They have used this room', 'since', 'Monday.'], ['He has stayed in bed', 'for', 'two days.'], ['We have been at school', 'since', 'eight o’clock.'],
      ['I have had this phone', 'for', 'a year.'], ['She has lived in town', 'since', '2018.'], ['They have watched TV', 'for', 'half an hour.'],
      ['He has been quiet', 'since', 'the lesson began.'], ['We have worked together', 'for', 'months.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['for', 'since', 'from'].filter(value => value !== answer)));
  })();

  generated[503] = (() => {
    const rows = [
      ['Before I arrived, they', 'had', 'left.'], ['She', 'had', 'done her homework before dinner.'], ['The film', 'had', 'started when we got there.'],
      ['We', 'had', 'eaten before the trip began.'], ['He', 'had', 'lost his phone before he found it.'], ['By noon, it', 'had', 'stopped raining.'],
      ['They', 'had', 'met before the party.'], ['I', 'had', 'seen the photo before.'], ['Mom', 'had', 'cooked the meal before we came home.'],
      ['The train', 'had', 'gone when we reached the station.'], ['She', 'had', 'read the book before the test.'], ['We', 'had', 'cleaned the room before guests arrived.'],
      ['He', 'had', 'fallen asleep before the film ended.'], ['I', 'had', 'forgotten my umbrella before it rained.'], ['They', 'had', 'finished lunch before class.'],
      ['The dog', 'had', 'run away before we opened the gate.'], ['She', 'had', 'called me before I called her.'], ['We', 'had', 'visited the museum before last year.'],
      ['He', 'had', 'taken the bus before he bought a bike.'], ['I', 'had', 'written the note before school.'], ['They', 'had', 'built the wall before winter.'],
      ['The sun', 'had', 'set before we got home.'], ['She', 'had', 'made tea before her friend arrived.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['have', 'has', 'was']));
  })();

  generated[504] = (() => {
    const rows = [
      ['The song is', 'sung', 'by the children.'], ['The door was', 'closed', 'by the guard.'], ['These pictures were', 'painted', 'by students.'],
      ['Rice is', 'grown', 'in many places.'], ['The car was', 'repaired', 'yesterday.'], ['The prizes were', 'given', 'after the game.'],
      ['The room is', 'cleaned', 'every day.'], ['The letter was', 'sent', 'last night.'], ['New books are', 'bought', 'for the library.'],
      ['The cake was', 'cut', 'into pieces.'], ['The road was', 'opened', 'last year.'], ['English is', 'used', 'around the world.'],
      ['The bridge was', 'designed', 'by an engineer.'], ['The plants are', 'watered', 'each morning.'], ['The answer was', 'found', 'quickly.'],
      ['The toy was', 'made', 'in China.'], ['The windows are', 'washed', 'on Friday.'], ['The match was', 'watched', 'by many people.'],
      ['The message was', 'received', 'this morning.'], ['The food is', 'served', 'at noon.'], ['The bags were', 'carried', 'upstairs.'],
      ['The homework is', 'checked', 'by the teacher.'], ['The museum was', 'visited', 'by tourists.']
    ];
    const base = { sung: 'sing', closed: 'close', painted: 'paint', grown: 'grow', repaired: 'repair', given: 'give', cleaned: 'clean', sent: 'send', bought: 'buy', cut: 'cut', opened: 'open', used: 'use', designed: 'design', watered: 'water', found: 'find', made: 'make', washed: 'wash', watched: 'watch', received: 'receive', served: 'serve', carried: 'carry', checked: 'check', visited: 'visit' };
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, [base[answer], `${base[answer]}ing`]));
  })();

  generated[505] = (() => {
    const rows = [
      ['If you hurry, you', 'will', 'catch the bus.'], ['If it is sunny, we', 'will', 'have a picnic.'], ['If she', 'calls', ', I will answer.'],
      ['They will be late if they', 'leave', 'now.'], ['If I finish early, I', 'will', 'help you.'], ['We will go out if the rain', 'stops', '.'],
      ['If he', 'studies', ', he will improve.'], ['You will feel better if you', 'rest', '.'], ['If the shop is open, I', 'will', 'buy milk.'],
      ['We will start when everyone', 'arrives', '.'], ['If you', 'mix', 'red and blue, you will get purple.'], ['She will smile if you', 'tell', 'a joke.'],
      ['If the phone rings, I', 'will', 'answer it.'], ['They will win if they', 'work', 'together.'], ['If it', 'snows', ', school will close.'],
      ['I will call you if I', 'need', 'help.'], ['If we save money, we', 'will', 'travel next year.'], ['He will be happy if he', 'gets', 'the job.'],
      ['If you', 'touch', 'fire, you will get hurt.'], ['We will eat outside if the weather', 'is', 'warm.'], ['If she', 'practices', ', she will sing well.'],
      ['I will stay home if I', 'feel', 'sick.'], ['If they', 'come', ', we will make tea.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['will', 'would', 'did'].filter(value => value !== answer)));
  })();

  generated[506] = (() => {
    const rows = [
      ['If I were taller, I', 'would', 'play basketball.'], ['She', 'would', 'travel more if she had time.'], ['If they lived nearby, we', 'would', 'meet often.'],
      ['If he', 'knew', 'the answer, he would tell us.'], ['I', 'would', 'buy that bike if I were rich.'], ['If we', 'had', 'a garden, we would grow flowers.'],
      ['If you studied more, you', 'would', 'learn faster.'], ['She', 'would', 'help if she could.'], ['If it', 'were', 'summer, we would swim.'],
      ['They', 'would', 'come if they were free.'], ['If I', 'had', 'wings, I would fly.'], ['He', 'would', 'join us if he had a ticket.'],
      ['If we', 'were', 'birds, we would fly south.'], ['You', 'would', 'feel better if you slept more.'], ['If she', 'lived', 'here, she would walk to school.'],
      ['I', 'would', 'call you if I had your number.'], ['If they', 'were', 'older, they would drive.'], ['He', 'would', 'cook if he knew how.'],
      ['If I', 'owned', 'a dog, I would name it Max.'], ['We', 'would', 'visit if we had time.'], ['If you', 'were', 'my teacher, you would be kind.'],
      ['She', 'would', 'dance if music played.'], ['If it', 'rained', ', we would stay inside.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['would', 'will', 'can'].filter(value => value !== answer)));
  })();

  generated[507] = (() => {
    const rows = [
      ['The woman', 'who', 'teaches us is kind.'], ['The phone', 'which', 'is ringing is mine.'], ['The dog', 'that', 'barked is small.'],
      ['The man', 'who', 'fixed the car is here.'], ['The book', 'which', 'has a blue cover is new.'], ['The cake', 'that', 'we made is delicious.'],
      ['The boy', 'who', 'is laughing is my cousin.'], ['The bike', 'which', 'is outside is hers.'], ['The film', 'that', 'we watched was funny.'],
      ['The doctor', 'who', 'helped me was busy.'], ['The bag', 'which', 'is on the chair is yours.'], ['The song', 'that', 'she sang was beautiful.'],
      ['The girl', 'who', 'won is happy.'], ['The game', 'which', 'we played was hard.'], ['The toy', 'that', 'he chose is red.'],
      ['The farmer', 'who', 'grows rice lives nearby.'], ['The train', 'which', 'leaves at six is late.'], ['The picture', 'that', 'I drew is on the wall.'],
      ['The student', 'who', 'asked is my friend.'], ['The robot', 'which', 'can talk is new.'], ['The chair', 'that', 'is broken needs repair.'],
      ['The singer', 'who', 'is on stage is famous.'], ['The watch', 'which', 'Dad bought is gold.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, answer === 'who' ? ['which', 'where'] : ['who', 'where']));
  })();

  generated[508] = (() => {
    const rows = [
      ["Amy said, ‘I am hungry.’ Amy said that she", 'was', 'hungry.'], ["Tom said, ‘I like tea.’ Tom said that he", 'liked', 'tea.'],
      ["They said, ‘We are ready.’ They said that they", 'were', 'ready.'], ["Ben said, ‘I will help.’ Ben said that he", 'would', 'help.'],
      ["Mia said, ‘I can swim.’ Mia said that she", 'could', 'swim.'], ["I said, ‘I have finished.’ I said that I", 'had', 'finished.'],
      ["Dad said, ‘I feel tired.’ Dad said that he", 'felt', 'tired.'], ["Sara said, ‘I need a pen.’ Sara said that she", 'needed', 'a pen.'],
      ["We said, ‘We live here.’ We said that we", 'lived', 'there.'], ["He said, ‘I saw a bird.’ He said that he", 'had seen', 'a bird.'],
      ["She said, ‘I will call you.’ She said that she", 'would', 'call me.'], ["They said, ‘We can wait.’ They said that they", 'could', 'wait.'],
      ["I said, ‘I am busy.’ I said that I", 'was', 'busy.'], ["The boy said, ‘I want cake.’ The boy said that he", 'wanted', 'cake.'],
      ["The girls said, ‘We are happy.’ The girls said that they", 'were', 'happy.'], ["Mom said, ‘I have cooked.’ Mom said that she", 'had cooked', '.'],
      ["He said, ‘I will come.’ He said that he", 'would', 'come.'], ["She said, ‘I can sing.’ She said that she", 'could', 'sing.'],
      ["We said, ‘We like the film.’ We said that we", 'liked', 'the film.'], ["I said, ‘I know the answer.’ I said that I", 'knew', 'the answer.'],
      ["Tom said, ‘I am at home.’ Tom said that he", 'was', 'at home.'], ["They said, ‘We have eaten.’ They said that they", 'had eaten', '.'],
      ["Lily said, ‘I will try.’ Lily said that she", 'would', 'try.']
    ];
    const wrongs = { was: ['is', 'am'], liked: ['likes', 'like'], were: ['are', 'was'], would: ['will', 'can'], could: ['can', 'will'], had: ['has', 'have'], felt: ['feel', 'feels'], needed: ['need', 'needs'], lived: ['live', 'lives'], 'had seen': ['has seen', 'saw'], wanted: ['want', 'wants'], 'had cooked': ['has cooked', 'cooked'], knew: ['know', 'knows'], 'had eaten': ['has eaten', 'ate'] };
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, wrongs[answer]));
  })();

  generated[509] = (() => {
    const rows = [
      ['I enjoy', 'reading', 'before bed.'], ['She decided', 'to study', 'tonight.'], ['We avoid', 'wasting', 'water.'],
      ['He hopes', 'to visit', 'Shanghai.'], ['They finished', 'cleaning', 'the room.'], ['I want', 'to learn', 'Japanese.'],
      ['She loves', 'drawing', 'animals.'], ['We plan', 'to travel', 'in summer.'], ['He dislikes', 'waiting', 'in line.'],
      ['They agreed', 'to help', 'us.'], ['I keep', 'forgetting', 'my keys.'], ['She needs', 'to buy', 'a notebook.'],
      ['We practice', 'speaking', 'English.'], ['He chose', 'to stay', 'home.'], ['They suggest', 'taking', 'the bus.'],
      ['I promise', 'to call', 'you.'], ['She stopped', 'talking', 'when class began.'], ['We expect', 'to arrive', 'early.'],
      ['He enjoys', 'cooking', 'for friends.'], ['They want', 'to win', 'the game.'], ['I avoid', 'eating', 'too much sugar.'],
      ['She learned', 'to swim', 'last year.'], ['We finished', 'writing', 'the report.']
    ];
    return rows.map(([start, answer, end]) => {
      return question(`${start} ___ ${end}`, answer, ['read', 'to read', 'reading', 'write']);
    });
  })();

  generated[510] = (() => {
    const rows = [
      ['You like music,', "don't", 'you?'], ['She is ready,', "isn't", 'she?'], ['They live here,', "don't", 'they?'],
      ['He can drive,', "can't", 'he?'], ['We were late,', "weren't", 'we?'], ['I am your friend,', "aren't", 'I?'],
      ["You don't smoke,", 'do', 'you?'], ["She isn't busy,", 'is', 'she?'], ["They can't swim,", 'can', 'they?'],
      ['He has finished,', "hasn't", 'he?'], ['We will come,', "won't", 'we?'], ['The dog is hungry,', "isn't", 'it?'],
      ['You went home,', "didn't", 'you?'], ["She did not call,", 'did', 'she?'], ['They are students,', "aren't", 'they?'],
      ['He should rest,', "shouldn't", 'he?'], ["We have not met,", 'have', 'we?'], ['It was cold,', "wasn't", 'it?'],
      ['You play tennis,', "don't", 'you?'], ["She will not leave,", 'will', 'she?'], ['They had eaten,', "hadn't", 'they?'],
      ["He doesn't know,", 'does', 'he?'], ['We can start now,', "can't", 'we?']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['do', 'does', 'is', 'are', 'can', 'will'].filter(value => value !== answer)));
  })();

  generated[511] = (() => {
    const rows = [
      ['The ground is wet. It', 'must', 'have rained.'], ['She is on the moon. She', "can't", 'be at school.'], ['The sky is dark. It', 'might', 'rain soon.'],
      ['He has a fever. He', 'must', 'feel ill.'], ['The door is locked. They', "can't", 'be inside.'], ['The lights are on. Someone', 'might', 'be home.'],
      ['She won every race. She', 'must', 'be fast.'], ['He is in Beijing today. He', "can't", 'be in Shanghai too.'], ['The phone is ringing. It', 'might', 'be Mom.'],
      ['The cake is gone. The children', 'must', 'have eaten it.'], ['The sign says CLOSED. The shop', "can't", 'be open.'], ['The bus is late. It', 'might', 'be stuck in traffic.'],
      ['Her hands are covered in paint. She', 'must', 'be painting.'], ['The keys are not on the table. They', "can't", 'be on the table.'], ['The dog is barking. It', 'might', 'hear something.'],
      ['His room is full of books. He', 'must', 'like reading.'], ['She is only two. She', "can't", 'drive a car.'], ['The weather report is unsure. It', 'might', 'snow.'],
      ['They are wearing uniforms. They', 'must', 'be students.'], ['The museum is closed. We', "can't", 'go in.'], ['I do not know who called. It', 'might', 'be my uncle.'],
      ['He has not slept all night. He', 'must', 'be tired.'], ['This box is too small for the toy. It', "can't", 'hold the toy.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['must', "can't", 'might'].filter(value => value !== answer)));
  })();

  generated[512] = (() => {
    const rows = [
      ['___ the road was long, we kept walking.', 'Although', 'Because', 'So'], ['I wore boots', 'because', 'it was wet.', 'although', 'but'],
      ['___ he was afraid, he spoke clearly.', 'Although', 'Because', 'So'], ['She smiled', 'because', 'she was happy.', 'although', 'but'],
      ['___ it was late, they finished the work.', 'Although', 'Because', 'So'], ['We stayed home', 'because', 'the storm was strong.', 'although', 'but'],
      ['___ the soup was hot, I ate it.', 'Although', 'Because', 'So'], ['He missed class', 'because', 'he was sick.', 'although', 'but'],
      ['___ the book was hard, she enjoyed it.', 'Although', 'Because', 'So'], ['They left early', 'because', 'the bus arrived.', 'although', 'but'],
      ['___ she is young, she is very brave.', 'Although', 'Because', 'So'], ['I closed the window', 'because', 'it was cold.', 'although', 'but'],
      ['___ he lost, he congratulated the winner.', 'Although', 'Because', 'So'], ['We chose the path', 'because', 'it was safer.', 'although', 'but'],
      ['___ the rain was heavy, the match continued.', 'Although', 'Because', 'So'], ['She brought food', 'because', 'we were hungry.', 'although', 'but'],
      ['___ the bag was heavy, he carried it.', 'Although', 'Because', 'So'], ['They laughed', 'because', 'the film was funny.', 'although', 'but'],
      ['___ I was tired, I finished the page.', 'Although', 'Because', 'So'], ['He ran', 'because', 'he was late.', 'although', 'but'],
      ['___ the task was difficult, we tried.', 'Although', 'Because', 'So'], ['We used a map', 'because', 'the road was new.', 'although', 'but'],
      ['___ the room was small, it was comfortable.', 'Although', 'Because', 'So']
    ];
    return rows.map(([start, answer, end, ...extra]) => question(`${start} ___ ${end}`, answer, extra.length ? extra : ['Although', 'because', 'so'].filter(value => value !== answer)));
  })();

  generated[513] = (() => {
    const rows = [
      ['Everyone', 'has', 'a turn.'], ['Each student', 'is', 'ready.'], ['Neither answer', 'is', 'right.'],
      ['Everybody', 'likes', 'music.'], ['Each of the books', 'has', 'a label.'], ['Someone', 'is', 'at the door.'],
      ['Nobody', 'knows', 'the answer.'], ['Every child', 'needs', 'a pencil.'], ['Neither boy', 'is', 'late.'],
      ['Everyone in the room', 'is', 'quiet.'], ['Each player', 'has', 'a number.'], ['Somebody', 'wants', 'to help.'],
      ['Everybody', 'is', 'welcome.'], ['Each bag', 'has', 'a name tag.'], ['Neither option', 'looks', 'easy.'],
      ['Everyone', 'enjoys', 'the game.'], ['Each animal', 'needs', 'water.'], ['Nobody', 'is', 'outside.'],
      ['Someone', 'has', 'my book.'], ['Everybody', 'knows', 'the rule.'], ['Each class', 'is', 'different.'],
      ['Neither child', 'has', 'a ticket.'], ['Everyone', 'wants', 'to win.']
    ];
    return rows.map(([subject, answer, end]) => question(`${subject} ___ ${end}`, answer, ['is', 'are', 'have', 'has'].filter(value => value !== answer)));
  })();

  generated[514] = (() => {
    const rows = [
      ['The coach made us', 'run', 'two laps.'], ['My parents let me', 'choose', 'the film.'], ['Please have her', 'send', 'the email.'],
      ['The joke made him', 'laugh', '.'], ['The teacher let us', 'use', 'a dictionary.'], ['I had the mechanic', 'check', 'the car.'],
      ['The news made her', 'smile', '.'], ['Dad let me', 'stay', 'up late.'], ['We had them', 'carry', 'the boxes.'],
      ['The music made everyone', 'dance', '.'], ['The guide let us', 'take', 'photos.'], ['She had her brother', 'fix', 'the lamp.'],
      ['The teacher made the class', 'listen', '.'], ['Mom let us', 'invite', 'friends.'], ['I had my friend', 'help', 'me.'],
      ['The wind made the door', 'close', '.'], ['The guard let us', 'enter', '.'], ['They had the team', 'practice', 'more.'],
      ['The film made me', 'cry', '.'], ['Our teacher let us', 'leave', 'early.'], ['He had the worker', 'paint', 'the wall.'],
      ['The game made the children', 'cheer', '.'], ['The manager let us', 'start', 'now.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, [`to ${answer}`, `${answer}ing`]));
  })();

  generated[515] = (() => {
    const rows = [
      ['Never', 'have', 'I visited that city.'], ['Seldom', 'does', 'she complain.'], ['Rarely', 'do', 'they arrive late.'],
      ['Never', 'has', 'he seen snow.'], ['Seldom', 'have', 'we heard such news.'], ['Rarely', 'does', 'the bus stop here.'],
      ['Never', 'did', 'I forget the date.'], ['Seldom', 'do', 'people walk here at night.'], ['Rarely', 'has', 'she missed class.'],
      ['Never', 'were', 'they so happy.'], ['Seldom', 'is', 'the road empty.'], ['Rarely', 'have', 'I felt so proud.'],
      ['Never', 'does', 'he eat fast food.'], ['Seldom', 'did', 'we use that room.'], ['Rarely', 'are', 'the shops open so late.'],
      ['Never', 'will', 'I tell anyone.'], ['Seldom', 'can', 'you see the stars clearly.'], ['Rarely', 'has', 'the team lost.'],
      ['Never', 'had', 'she tried sushi before.'], ['Seldom', 'do', 'I watch TV.'], ['Rarely', 'does', 'my cat make noise.'],
      ['Never', 'have', 'we been so busy.'], ['Seldom', 'are', 'they wrong.']
    ];
    return rows.map(([start, answer, end]) => question(`${start} ___ ${end}`, answer, ['do', 'does', 'have', 'has', 'is', 'are', 'did', 'will', 'can'].filter(value => value !== answer)));
  })();

  return Object.fromEntries(Object.entries(generated).map(([id, list]) => [id, addDifficulty(list)]));
}

function expand(filePath, extras) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let lessonCount = 0;

  for (const gradeData of Object.values(data)) {
    for (const lesson of gradeData.grammar ?? []) {
      const additions = extras[lesson.id];
      if (!additions || additions.length !== 23) {
        throw new Error(`Lesson ${lesson.id} does not have exactly 23 approved additions.`);
      }

      // Correct one missing article in an existing past-perfect item before appending.
      if (lesson.id === 503) {
        const existing = lesson.questions.find(item => item.q === 'By the time we got home, Mom ___ cooked meal.');
        if (existing) existing.q = 'By the time we got home, Mom ___ cooked the meal.';
      }

      if (lesson.id === 203) {
        const pluralChoiceRepairs = {
          'I have two ___ in my bag.': ['books', 'book', 'a book'],
          'She sees three colorful ___.': ['birds', 'bird', 'a bird'],
          'There are four wooden ___.': ['boxes', 'box', 'a box'],
          'He washes the glass ___ after dinner.': ['dishes', 'dish', 'a dish'],
          'Look at the red ___ on the tree.': ['apples', 'apple', 'an apple'],
          'The yellow school ___ are fast.': ['buses', 'bus', 'a bus'],
          'Two small ___ ran across the room.': ['cats', 'cat', 'a cat']
        };
        for (const item of lesson.questions) {
          if (pluralChoiceRepairs[item.q]) item.options = pluralChoiceRepairs[item.q];
        }
      }

      // The first seven questions are the original reviewed lesson items.  Slice
      // them so this generator can be safely run again without duplicating a bank.
      const existingQuestions = (lesson.questions ?? []).slice(0, 7);
      const merged = [...existingQuestions, ...additions];
      if (merged.length !== 30) throw new Error(`Lesson ${lesson.id} has ${merged.length} questions; expected 30.`);

      const seenPrompts = new Set();
      for (const item of merged) {
        if (!item.q || seenPrompts.has(item.q)) throw new Error(`Duplicate or missing prompt in lesson ${lesson.id}: ${item.q}`);
        seenPrompts.add(item.q);
        item.options = unique(item.options ?? []);
        if (item.options.length < 3 || !item.options.includes(item.a)) {
          throw new Error(`Invalid answer choices in lesson ${lesson.id}: ${item.q}`);
        }
        item.options = item.options.slice(0, 3);
      }

      // A consistent 10/10/10 difficulty spread keeps question-bank rewards balanced.
      lesson.questions = merged.map((item, index) => ({ ...item, difficulty: index < 10 ? 1 : index < 20 ? 2 : 3 }));
      lessonCount++;
    }
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return lessonCount;
}

const extras = makeQuestions();
const results = FILES.map(file => expand(file, extras));
if (results[0] !== 45 || results[1] !== 45) throw new Error('Expected to expand 45 grammar lessons.');

console.log(`Expanded ${results[0]} grammar lessons to 30 questions each.`);

import fs from 'fs';

const FILES = ['backend/curriculum.json', 'frontend/user-app/src/data/curriculum.json'];

const makeQuestion = (q, a, options) => ({ q, a, options: [...new Set(options)] });
const bank = rows => {
  if (rows.length !== 30) throw new Error(`Expected 30 bank questions, found ${rows.length}.`);
  const seen = new Set();
  return rows.map((row, index) => {
    if (seen.has(row.q)) throw new Error(`Duplicate bank prompt: ${row.q}`);
    seen.add(row.q);
    if (row.options.length !== 3 || !row.options.includes(row.a)) {
      throw new Error(`Invalid choices for: ${row.q}`);
    }
    return { ...row, difficulty: index < 10 ? 1 : index < 20 ? 2 : 3 };
  });
};
const withBank = (base, rows) => {
  const bankQuestions = bank(rows);
  return {
    ...base,
    // The Learn tab deliberately uses only three short, varied checks.
    questions: [bankQuestions[0], bankQuestions[15], bankQuestions[29]].map(({ difficulty, ...item }) => item),
    bankQuestions
  };
};
const threeOptions = (answer, first, second) => [answer, first, second];
const words = value => value.trim().split(/\s*;\s*/);

function pluralDemonstratives() {
  const near = words('books on my desk; flowers in my hand; apples in this basket; shoes by the door; crayons on the table; ducks in this pond; pictures in my bag; cups beside me; kites in our yard; leaves on this branch; eggs in this box; socks on the chair; toys on the floor; chairs in this room; stickers in my notebook');
  const far = words('mountains across the field; trees by that road; houses on that hill; birds in the far sky; boats on the lake; sheep in that field; lights across the river; clouds over that hill; bikes by the gate; stars in the night sky; shops across the street; flags near that building; children at the far playground; buses at that stop; flowers by the wall');
  return [...near.map(item => makeQuestion(`___ ${item} are close to me.`, 'These', threeOptions('These', 'Those', 'This'))), ...far.map(item => makeQuestion(`___ ${item} are far from me.`, 'Those', threeOptions('Those', 'These', 'That')))];
}

function thereIsAre() {
  const one = words('a cat under the table; a book in my bag; a tree by the road; a bird in the cage; a cup on the desk; a bus at the stop; an apple in the bowl; a kite in the sky; a rabbit in the garden; a lamp in the room; a fish in the pond; a teacher at the door; a pencil on the floor; a dog by the gate; a star above us');
  const many = words('three cats under the table; two books in my bag; tall trees by the road; birds in the cage; cups on the desk; buses at the stop; apples in the bowl; kites in the sky; rabbits in the garden; lamps in the room; fish in the pond; teachers at the door; pencils on the floor; dogs by the gate; stars above us');
  return [...one.map(item => makeQuestion(`___ ${item}.`, 'There is', threeOptions('There is', 'There are', 'There am'))), ...many.map(item => makeQuestion(`___ ${item}.`, 'There are', threeOptions('There are', 'There is', 'There am')))];
}

function doDoesQuestions() {
  const doRows = words('you like rice; they play after school; we have English today; your friends walk to school; you read at night; the children help at home; your parents work here; we eat lunch at school; you see the bird; they live near here; you want some water; the boys ride bikes; we need our books; your sisters sing well; you know this word');
  const doesRows = words('your brother like rice; the girl play after school; your teacher have English today; the boy walk to school; your mother read at night; the child help at home; your father work here; the baby eat lunch now; the dog see the bird; the farmer live near here; your sister want some water; the girl ride a bike; the student need a book; your cousin sing well; the teacher know this word');
  return [...doRows.map(item => makeQuestion(`___ ${item}?`, 'Do', threeOptions('Do', 'Does', 'Is'))), ...doesRows.map(item => makeQuestion(`___ ${item}?`, 'Does', threeOptions('Does', 'Do', 'Are')))];
}

function doDoesNegatives() {
  const doRows = words('I ___ like cold tea.;We ___ play on rainy days.;They ___ live in the city.;You ___ need a new bag.;The boys ___ walk to school on Sunday.;My friends ___ eat meat.;We ___ watch TV in class.;The children ___ go out at night.;You ___ have a pet.;The girls ___ sing every day.;My parents ___ work on Sunday.;We ___ use phones in class.;They ___ want milk now.;You ___ read in the dark.;The ducks ___ fly at night.');
  const doesRows = words('He ___ like cold tea.;She ___ play on rainy days.;The dog ___ live in the city.;My brother ___ need a new bag.;The girl ___ walk to school on Sunday.;My sister ___ eat meat.;Dad ___ watch TV in class.;The baby ___ go out at night.;The cat ___ have a pet.;The boy ___ sing every day.;Mom ___ work on Sunday.;The teacher ___ use phones in class.;The child ___ want milk now.;Grandpa ___ read in the dark.;The bird ___ fly at night.');
  return [...doRows.map(q => makeQuestion(q, 'do not', threeOptions('do not', 'does not', 'is not'))), ...doesRows.map(q => makeQuestion(q, 'does not', threeOptions('does not', 'do not', 'is not')))];
}

function possessiveS() {
  const rows = words('girl;boy;teacher;farmer;mother;father;child;doctor;singer;driver;cat;dog;duck;bird;student;friend;baby;worker;painter;player;grandma;grandpa;aunt;uncle;coach;cook;brother;sister;guide;nurse');
  const things = words('bike;bag;book;hat;coat;pen;ball;shoe;cup;key;tail;bowl;nest;wing;desk;notebook;toy;tool;picture;ticket;scarf;watch;garden;camera;whistle;pan;basket;map;lantern;field');
  return rows.map((owner, index) => {
    const answer = `${owner}'s`;
    return makeQuestion(`This is the ___ ${things[index]}.`, answer, threeOptions(answer, owner, `${owner}s`));
  });
}

function nextToBetween() {
  const next = words('The cat is ___ the chair.;The cup is ___ the plate.;The bus stop is ___ the school.;The tree is ___ the house.;The book is ___ the lamp.;The dog sleeps ___ the door.;The bike is ___ the wall.;The duck is ___ the pond.;The bag is ___ my desk.;The ball is ___ the box.;The flower is ___ the window.;The pencil is ___ the ruler.;The shop is ___ the bank.;The bird sits ___ the nest.;The bench is ___ the path.');
  const between = words('The ball is ___ the two boxes.;The cat sits ___ the chairs.;The school is ___ the library and the shop.;The tree is ___ the house and the road.;The cup is ___ the two plates.;The dog stands ___ the children.;The bike is ___ the cars.;The duck swims ___ the boats.;The bag is ___ my two books.;The ball rolls ___ the goals.;The flower grows ___ two rocks.;The pencil is ___ the pens.;The shop is ___ the bank and the post office.;The bird flies ___ two trees.;The bench is ___ the gates.');
  return [...next.map(q => makeQuestion(q, 'next to', threeOptions('next to', 'between', 'under'))), ...between.map(q => makeQuestion(q, 'between', threeOptions('between', 'next to', 'under')))];
}

function beforeAfter() {
  const before = words('Wash your hands ___ dinner.;Put on your coat ___ you go outside.;Look both ways ___ you cross the road.;Pack your bag ___ school.;Brush your teeth ___ bed.;Feed the dog ___ you leave.;Close the gate ___ you go.;Read the rules ___ the game.;Clean the table ___ lunch.;Check your work ___ you give it to the teacher.;Water the plants ___ school.;Put on your shoes ___ you run.;Say hello ___ you start talking.;Wash the fruit ___ you eat it.;Find your book ___ class starts.');
  const after = words('We play ___ school.;I rest ___ lunch.;She washes the cup ___ she uses it.;They go home ___ class.;We clean up ___ the game.;He feeds the dog ___ dinner.;Put your book away ___ reading.;The birds sing ___ the rain.;We talk ___ the lesson.;She calls Dad ___ school.;The cat sleeps ___ it eats.;I draw ___ my homework.;They clap ___ the song.;We wash up ___ cooking.;He smiles ___ the race.');
  return [...before.map(q => makeQuestion(q, 'before', threeOptions('before', 'after', 'under'))), ...after.map(q => makeQuestion(q, 'after', threeOptions('after', 'before', 'in')))];
}

function atOnTime() {
  const times = words('The class starts ___ 8:00.;We eat lunch ___ noon.;The bus comes ___ seven.;I wake up ___ 6:30.;The film starts ___ 3:00.;Dad gets home ___ five.;We meet ___ 10:15.;The shop opens ___ nine.;I go to bed ___ 9:00.;The train leaves ___ 7:45.;The game begins ___ four.;We have breakfast ___ 7:20.;The bell rings ___ eight.;She reads ___ night.;The library closes ___ six.');
  const days = words('We have music ___ Monday.;The market is open ___ Saturday.;My class cleans ___ Friday.;The game is ___ Sunday.;We visit Grandma ___ Tuesday.;The meeting is ___ Wednesday.;School ends early ___ Thursday.;The club meets ___ Monday.;They plant trees ___ Saturday.;The shop closes ___ Sunday.;We draw pictures ___ Friday.;The bus is busy ___ Monday.;The fair is ___ Tuesday.;She has art ___ Wednesday.;We play ball ___ Thursday.');
  return [...times.map(q => makeQuestion(q, 'at', threeOptions('at', 'on', 'in'))), ...days.map(q => makeQuestion(q, 'on', threeOptions('on', 'at', 'in')))];
}

function someAny() {
  const some = words('We have ___ apples.;I need ___ water.;She bought ___ pencils.;There is ___ rice in the bowl.;They have ___ books.;Dad has ___ tea.;I see ___ birds.;We need ___ paper.;She has ___ milk.;There are ___ flowers.;I want ___ juice.;They bought ___ eggs.;We have ___ bread.;There is ___ soup.;I found ___ stickers.');
  const any = words('Do you have ___ apples?;Is there ___ water?;Did she buy ___ pencils?;Is there ___ rice?;Do they have ___ books?;Does Dad have ___ tea?;Do you see ___ birds?;Do we need ___ paper?;Does she have ___ milk?;Are there ___ flowers?;Do you want ___ juice?;Did they buy ___ eggs?;Do we have ___ bread?;Is there ___ soup?;Did you find ___ stickers?');
  return [...some.map(q => makeQuestion(q, 'some', threeOptions('some', 'any', 'an'))), ...any.map(q => makeQuestion(q, 'any', threeOptions('any', 'some', 'a')))];
}

function canQuestions() {
  const rows = words('you swim;your brother ride a bike;the dog run fast;we play after school;the bird fly;your friends come today;she draw a cat;he help us;the children sing;your mother cook noodles;they carry the boxes;the baby walk;the fish swim;your sister read this word;I sit here;the boy jump high;you open the window;the cat climb the tree;we use this room;your teacher help me;the ducks fly;your father drive;she make a kite;he count to ten;the girls dance;the farmer lift the bag;your friends wait here;the rabbit hop;we start now;the child find the ball');
  return rows.map(item => makeQuestion(`___ ${item}?`, 'Can', threeOptions('Can', 'Do', 'Are')));
}

function presentSimpleContinuous() {
  const simple = words('Every day, she ___ to school.;My father ___ rice at home.;The dog ___ in the yard every morning.;We ___ English on Monday.;The birds ___ in that tree each day.;My sister ___ her room on Saturday.;I ___ milk for breakfast.;The farmer ___ vegetables.;They ___ the bus to school.;He ___ his homework after dinner.;The cat ___ on the chair every afternoon.;We ___ games at break time.;My mother ___ a story at night.;The children ___ in the park on Sunday.;The shop ___ at eight.');
  const cont = words('Look! She ___ to school now.;My father ___ rice now.;The dog ___ in the yard now.;We ___ English right now.;Listen! The birds ___ in that tree.;My sister ___ her room now.;I ___ milk now.;The farmer ___ vegetables now.;They ___ for the bus now.;He ___ his homework now.;The cat ___ on the chair now.;We ___ a game now.;My mother ___ a story now.;The children ___ in the park now.;The shop ___ now.');
  const simpleAnswers = ['walks', 'cooks', 'runs', 'study', 'sing', 'cleans', 'drink', 'grows', 'take', 'does', 'sleeps', 'play', 'reads', 'play', 'opens'];
  const contAnswers = ['is walking', 'is cooking', 'is running', 'are studying', 'are singing', 'is cleaning', 'am drinking', 'is growing', 'are waiting', 'is doing', 'is sleeping', 'are playing', 'is reading', 'are playing', 'is opening'];
  return [...simple.map((q, i) => makeQuestion(q, simpleAnswers[i], threeOptions(simpleAnswers[i], contAnswers[i], 'is'))), ...cont.map((q, i) => makeQuestion(q, contAnswers[i], threeOptions(contAnswers[i], simpleAnswers[i], 'is')))];
}

function thereWasWere() {
  const one = words('___ a cat in the garden yesterday.;___ a book on the desk this morning.;___ a tree by the road last year.;___ a bird in the cage yesterday.;___ a cup on the table.;___ a bus at the stop.;___ an apple in the bowl.;___ a kite in the sky.;___ a rabbit in the field.;___ a lamp in the room.;___ a fish in the pond.;___ a teacher at the door.;___ a pencil on the floor.;___ a dog by the gate.;___ a star in the sky.');
  const many = words('___ two cats in the garden yesterday.;___ books on the desk this morning.;___ trees by the road last year.;___ birds in the cage yesterday.;___ cups on the table.;___ buses at the stop.;___ apples in the bowl.;___ kites in the sky.;___ rabbits in the field.;___ lamps in the room.;___ fish in the pond.;___ teachers at the door.;___ pencils on the floor.;___ dogs by the gate.;___ stars in the sky.');
  return [...one.map(q => makeQuestion(q, 'There was', threeOptions('There was', 'There were', 'There is'))), ...many.map(q => makeQuestion(q, 'There were', threeOptions('There were', 'There was', 'There are')))];
}

function didQuestions() {
  const rows = words('you visit your grandparents yesterday;she clean her room last night;they play football after school;he walk home yesterday;we watch the film last week;your sister cook dinner;the dog bark at the cat;the children help the teacher;your father fix the bike;you finish your homework;the bird fly away;she call her friend;they open the window;he carry the box;we paint the wall;you wash the dishes;the farmer water the plants;she jump over the rope;they visit the museum;he start the game;we use the map;your mother make soup;the cat climb the tree;she answer the question;they wait for the bus;he close the gate;we plant flowers;you listen to the story;she dance at the show;they clean the classroom');
  return rows.map(item => makeQuestion(`___ ${item}?`, 'Did', threeOptions('Did', 'Do', 'Does')));
}

function didntPast() {
  const rows = words('I ___ play outside yesterday.;We ___ visit the shop last week.;They ___ watch TV last night.;You ___ clean the table.;The boys ___ walk home yesterday.;My friends ___ eat lunch there.;We ___ use the bus.;The children ___ go out in the rain.;You ___ finish the game.;The girls ___ sing at the show.;My parents ___ work on Sunday.;We ___ open the window.;They ___ want milk.;You ___ read the book.;The ducks ___ fly away.;He ___ play outside yesterday.;She ___ visit the shop last week.;The dog ___ watch TV last night.;My brother ___ clean the table.;The girl ___ walk home yesterday.;My sister ___ eat lunch there.;Dad ___ use the bus.;The baby ___ go out in the rain.;The cat ___ finish the game.;The boy ___ sing at the show.;Mom ___ work on Sunday.;The teacher ___ open the window.;The child ___ want milk.;Grandpa ___ read the book.;The bird ___ fly away.');
  return rows.map(q => makeQuestion(q, "didn't", threeOptions("didn't", "don't", "doesn't")));
}

function wantNeedTo() {
  const rows = words('I want ___ a kite.;She wants ___ a book.;We need ___ our homework.;They want ___ the game.;He needs ___ the bus.;You want ___ a song.;My sister needs ___ the room.;The children want ___ outside.;Dad needs ___ the bike.;I want ___ some water.;She needs ___ her teacher.;We want ___ a picture.;They need ___ early.;He wants ___ his friend.;You need ___ your bag.;I want ___ my shoes.;She wants ___ a letter.;We need ___ the door.;They want ___ to music.;He needs ___ the plants.;You want ___ the story.;My mother needs ___ dinner.;The boys want ___ football.;I need ___ the answer.;She wants ___ home.;We need ___ the map.;They want ___ the cake.;He needs ___ the box.;You want ___ English.;The girl needs ___ the window.');
  const verbs = words('to make;to read;to finish;to win;to catch;to sing;to clean;to play;to fix;to drink;to ask;to draw;to leave;to call;to pack;to tie;to write;to close;to listen;to water;to hear;to cook;to play;to find;to go;to use;to eat;to carry;to practice;to open');
  return rows.map((q, i) => makeQuestion(q, verbs[i], threeOptions(verbs[i], verbs[i].slice(3), `${verbs[i].slice(3)}ing`)));
}

function manyMuch() {
  const many = words('How ___ apples are there?;How ___ books do you have?;How ___ students are in class?;How ___ eggs are in the bowl?;How ___ buses come here?;How ___ flowers can you see?;How ___ pencils do we need?;How ___ birds are in the tree?;How ___ chairs are in the room?;How ___ bags are on the floor?;How ___ carrots did she buy?;How ___ cups are on the table?;How ___ dogs are in the yard?;How ___ kites are in the sky?;How ___ shoes are by the door?');
  const much = words('How ___ water do we need?;How ___ rice is in the bowl?;How ___ milk is there?;How ___ tea does Dad drink?;How ___ juice is in the cup?;How ___ bread do you want?;How ___ soup is in the pot?;How ___ rain fell last night?;How ___ sugar is in the cake?;How ___ money do you have?;How ___ paper do we need?;How ___ meat did they buy?;How ___ coffee is in the cup?;How ___ salt is in the soup?;How ___ time do we have?');
  return [...many.map(q => makeQuestion(q, 'many', threeOptions('many', 'much', 'any'))), ...much.map(q => makeQuestion(q, 'much', threeOptions('much', 'many', 'some')))];
}

function fewLittle() {
  const few = words('There are ___ apples left.;I have ___ books in my bag.;She has ___ pencils.;We saw ___ birds.;They bought ___ eggs.;There are ___ chairs here.;I need ___ coins.;He has ___ friends nearby.;We found ___ shells.;She picked ___ flowers.;There are ___ buses today.;I have ___ questions.;They keep ___ rabbits.;We saw ___ stars.;He bought ___ stamps.');
  const little = words('There is ___ water left.;I have ___ milk.;She has ___ time today.;We need ___ rice.;They bought ___ juice.;There is ___ soup.;I need ___ help.;He has ___ money.;We found ___ sugar.;She used ___ paint.;There is ___ tea.;I have ___ homework.;They need ___ salt.;We saw ___ snow.;He drank ___ coffee.');
  return [...few.map(q => makeQuestion(q, 'a few', threeOptions('a few', 'a little', 'much'))), ...little.map(q => makeQuestion(q, 'a little', threeOptions('a little', 'a few', 'many')))];
}

function adverbsLy() {
  const rows = [
    ['The turtle walks ___.', 'slowly', 'slow'], ['The rabbit runs ___.', 'quickly', 'quick'], ['Please speak ___.', 'quietly', 'quiet'], ['The baby smiles ___.', 'happily', 'happy'], ['The bird sings ___.', 'softly', 'soft'], ['The dog waits ___.', 'quietly', 'quiet'], ['The girl answers ___.', 'carefully', 'careful'], ['The boy talks ___.', 'kindly', 'kind'], ['The farmer works ___.', 'carefully', 'careful'], ['The children play ___.', 'happily', 'happy'], ['The teacher explains it ___.', 'clearly', 'clear'], ['The cat moves ___.', 'quietly', 'quiet'], ['The bus goes ___.', 'slowly', 'slow'], ['She writes ___.', 'neatly', 'neat'], ['He speaks ___.', 'softly', 'soft'], ['The bird flies ___.', 'quickly', 'quick'], ['The child paints ___.', 'carefully', 'careful'], ['We walk ___.', 'quickly', 'quick'], ['She laughs ___.', 'happily', 'happy'], ['The dog barks ___.', 'loudly', 'loud'], ['The boy reads ___.', 'clearly', 'clear'], ['The girl sings ___.', 'softly', 'soft'], ['The turtle eats ___.', 'slowly', 'slow'], ['The farmer smiles ___.', 'kindly', 'kind'], ['They wait ___.', 'quietly', 'quiet'], ['The baby sleeps ___.', 'quietly', 'quiet'], ['We pack ___.', 'carefully', 'careful'], ['He draws ___.', 'neatly', 'neat'], ['She closes the door ___.', 'quietly', 'quiet'], ['The children clap ___.', 'loudly', 'loud']
  ];
  return rows.map(([q, a, adjective]) => makeQuestion(q, a, threeOptions(a, adjective, `${adjective}er`)));
}

function movementPrepositions() {
  const to = words('We walk ___ school.;She goes ___ the market.;The bus goes ___ town.;I run ___ the gate.;They travel ___ Beijing.;He walks ___ the river.;The dog runs ___ me.;We go ___ the library.;She rides ___ the farm.;The children walk ___ the park.');
  const from = words('I come ___ school.;She walks ___ the market.;The bus comes ___ town.;He runs ___ the gate.;They travel ___ the capital.;We walk ___ the river.;The dog comes ___ me.;I borrow a book ___ the library.;She rides home ___ the farm.;The children come ___ the park.');
  const into = words('The cat jumps ___ the box.;She walks ___ the room.;The dog runs ___ the house.;We go ___ the shop.;The bird flies ___ the cage.;He puts the book ___ the bag.;They walk ___ the garden.;The rabbit hops ___ the hole.;I pour water ___ the cup.;The children run ___ the classroom.');
  return [...to.map(q => makeQuestion(q, 'to', threeOptions('to', 'from', 'into'))), ...from.map(q => makeQuestion(q, 'from', threeOptions('from', 'to', 'into'))), ...into.map(q => makeQuestion(q, 'into', threeOptions('into', 'to', 'from')))];
}

function howOften() {
  const rows = words('___ do you play football? — Every Saturday.;___ does she visit Grandma? — Once a month.;___ do they have art class? — Twice a week.;___ does he read English? — Every night.;___ do we clean the room? — Every Friday.;___ does your father call? — Every week.;___ do the children water the plants? — Every day.;___ does she go swimming? — Once a week.;___ do you ride your bike? — On Sundays.;___ does the bus come? — Every hour.;___ do they play games? — After school each day.;___ does he feed the dog? — Every morning.;___ do we visit the library? — Twice a month.;___ does she practice the piano? — Every evening.;___ do you help at home? — Every day.;___ does the club meet? — Every Tuesday.;___ do the birds sing here? — Every morning.;___ does he wash the car? — Once a month.;___ do we have a test? — Once a term.;___ does she draw? — Every afternoon.;___ do you talk to your cousin? — Every week.;___ does the farmer check the field? — Each day.;___ do they go to the market? — Every Sunday.;___ does he play chess? — Twice a week.;___ do we eat together? — Every evening.;___ does she write to her friend? — Once a month.;___ do you see your grandparents? — Every holiday.;___ does the teacher read to the class? — Every Friday.;___ do they wash their uniforms? — Every week.;___ does he practice running? — Every day.');
  return rows.map(q => makeQuestion(q, 'How often', threeOptions('How often', 'How many', 'How much')));
}

function usedTo() {
  const rows = words('When I was little, I ___ live near the river.;My father ___ walk to school when he was young.;We ___ play outside every day.;She ___ have a small bike.;They ___ visit the farm in summer.;He ___ be afraid of dogs.;My mother ___ sing in the school band.;The children ___ make paper boats.;I ___ watch the stars at night.;The town ___ have one small shop.;She ___ help her grandma after school.;We ___ eat together every Sunday.;He ___ keep ducks in the yard.;They ___ live in a small house.;I ___ draw animals all the time.;My brother ___ ride a small bike.;We ___ play games after dinner.;She ___ wear glasses.;The school ___ have a big tree.;They ___ walk along the road.;I ___ carry my books in a red bag.;He ___ visit his uncle each summer.;We ___ help in the garden.;She ___ read picture books.;The family ___ grow vegetables.;I ___ be shy in class.;They ___ play by the pond.;He ___ have a pet rabbit.;We ___ listen to the radio at night.;She ___ live near the mountain.');
  return rows.map(q => makeQuestion(q, 'used to', threeOptions('used to', 'use to', 'is used to')));
}

function wouldLikeTo() {
  const rows = words('I would like ___ a kite.;She would like ___ some tea.;We would like ___ the museum.;They would like ___ the game.;He would like ___ the bus.;You would like ___ a song.;My sister would like ___ a picture.;The children would like ___ outside.;Dad would like ___ the bike.;I would like ___ some water.;She would like ___ her teacher.;We would like ___ a card.;They would like ___ early.;He would like ___ his friend.;You would like ___ your bag.;I would like ___ my shoes.;She would like ___ a letter.;We would like ___ the door.;They would like ___ to music.;He would like ___ the plants.;You would like ___ the story.;My mother would like ___ dinner.;The boys would like ___ football.;I would like ___ the answer.;She would like ___ home.;We would like ___ the map.;They would like ___ the cake.;He would like ___ the box.;You would like ___ English.;The girl would like ___ the window.');
  const verbs = words('to make;to drink;to visit;to win;to catch;to sing;to draw;to play;to fix;to have;to ask;to make;to leave;to call;to pack;to tie;to write;to close;to listen;to water;to hear;to cook;to play;to find;to go;to use;to eat;to carry;to practice;to open');
  return rows.map((q, i) => makeQuestion(q, verbs[i], threeOptions(verbs[i], verbs[i].slice(3), `${verbs[i].slice(3)}ing`)));
}

function needToDontHaveTo() {
  const need = words('You ___ wear a helmet on this road.;We ___ bring our books to class.;She ___ finish her homework.;They ___ wait for the green light.;He ___ feed the dog.;I ___ clean my desk.;The children ___ listen to the teacher.;Dad ___ fix the broken gate.;You ___ wash your hands before lunch.;We ___ arrive on time.;She ___ take her medicine.;They ___ keep the room clean.;He ___ carry his school card.;I ___ help my little sister.;The farmer ___ water the plants.');
  const notNeed = words('You ___ bring food, lunch is ready.;We ___ walk, the bus is here.;She ___ cook, Dad made dinner.;They ___ wait, the shop is open.;He ___ carry the box, it is empty.;I ___ clean today, my brother did it.;The children ___ bring pens, the teacher has some.;Dad ___ fix the gate today, it still works.;You ___ wear a coat, it is warm.;We ___ leave now, the film starts later.;She ___ take a bag, the shop has bags.;They ___ buy water, there is water here.;He ___ run, we have time.;I ___ call now, she will call later.;The farmer ___ water the plants, it is raining.');
  return [...need.map(q => makeQuestion(q, 'need to', threeOptions('need to', "don't have to", 'needs to'))), ...notNeed.map(q => makeQuestion(q, "don't have to", threeOptions("don't have to", 'need to', "doesn't have to")))];
}

function bothAnd() {
  const rows = words('Both the cat ___ the dog are sleeping.;Both rice ___ noodles are ready.;Both Mia ___ her brother can swim.;Both the book ___ the film are good.;Both my mother ___ my father are home.;Both the red bag ___ the blue bag are new.;Both the farmer ___ the teacher are smiling.;Both apples ___ pears are in the bowl.;Both the bus ___ the train are late.;Both my cousin ___ my friend are coming.;Both the sun ___ the moon are in the sky.;Both the bird ___ the rabbit are small.;Both English ___ Chinese are school subjects.;Both the girl ___ the boy are reading.;Both the shop ___ the market are open.;Both the dog ___ the cat need water.;Both the soup ___ the rice are hot.;Both my aunt ___ my uncle are teachers.;Both the bike ___ the car are outside.;Both the singer ___ the dancer are ready.;Both the ducks ___ the fish are in the pond.;Both the flower ___ the tree are green.;Both the pencils ___ the pens are on the desk.;Both the baby ___ the child are laughing.;Both the doctor ___ the nurse are busy.;Both the games ___ the songs are fun.;Both the library ___ the museum are quiet.;Both the boots ___ the coat are dry.;Both the window ___ the door are open.;Both the cup ___ the bowl are clean.');
  return rows.map(q => makeQuestion(q, 'and', threeOptions('and', 'or', 'but')));
}

function eitherOr() {
  const rows = words('rice;tea;the bus;the bike;today;tomorrow;the red pen;the blue pen;the book;the film;an apple;an orange;at home;at school;the park;the library;walk;run;sing;dance;the small bag;the big bag;the train;the car;morning;afternoon;the game;the story;the shop;the market');
  const second = words('noodles;milk;the train;the car;Saturday;Sunday;the green pen;the black pen;the song;the game;a pear;a banana;in the yard;in the classroom;the farm;the museum;ride;swim;read;draw;the red bag;the blue bag;the bus;the bike;evening;night;the puzzle;the song;the bank;the library');
  return rows.map((left, i) => makeQuestion(`You can choose either ${left} ___ ${second[i]}.`, 'or', threeOptions('or', 'and', 'but')));
}

function notAsAs() {
  const rows = [
    ['The blue bag is not as ___ as the red bag.', 'heavy'], ['This road is not as ___ as that road.', 'long'], ['My bike is not as ___ as your bike.', 'new'], ['The small box is not as ___ as the big box.', 'wide'], ['Today is not as ___ as yesterday.', 'hot'], ['The cat is not as ___ as the dog.', 'fast'], ['This book is not as ___ as that book.', 'thick'], ['The river is not as ___ as the lake.', 'deep'], ['My room is not as ___ as your room.', 'clean'], ['The apple is not as ___ as the pear.', 'sweet'], ['The green tree is not as ___ as the tall tree.', 'tall'], ['This chair is not as ___ as that chair.', 'soft'], ['The path is not as ___ as the road.', 'straight'], ['My pencil is not as ___ as yours.', 'long'], ['The soup is not as ___ as the tea.', 'warm'], ['This hat is not as ___ as that hat.', 'big'], ['The new bag is not as ___ as the old bag.', 'full'], ['The bus is not as ___ as the train.', 'quick'], ['My coat is not as ___ as your coat.', 'thick'], ['The pond is not as ___ as the river.', 'wide'], ['This test is not as ___ as the last test.', 'hard'], ['The blue kite is not as ___ as the red kite.', 'high'], ['My bowl is not as ___ as your bowl.', 'deep'], ['The morning is not as ___ as the afternoon.', 'bright'], ['This shoe is not as ___ as that shoe.', 'clean'], ['The little dog is not as ___ as the big dog.', 'strong'], ['My desk is not as ___ as your desk.', 'tidy'], ['This story is not as ___ as the film.', 'funny'], ['The field is not as ___ as the park.', 'green'], ['My umbrella is not as ___ as yours.', 'large']
  ];
  return rows.map(([q, a]) => makeQuestion(q, a, threeOptions(a, `more ${a}`, `the most ${a}`)));
}

function tooEnough() {
  const too = words('This tea is ___ hot to drink.;The bag is ___ heavy for the child.;The road is ___ wet to run on.;That box is ___ small for the toys.;The soup is ___ cold to eat.;The music is ___ loud for the baby.;The wall is ___ high to climb.;The water is ___ deep to cross.;The shoes are ___ small for me.;The book is ___ hard for the first day.;The sun is ___ bright to look at.;The bus is ___ full to get on.;The cake is ___ big for one person.;The hill is ___ steep to ride up.;The room is ___ dark to read in.');
  const enough = words('The tea is warm ___ to drink.;The bag is light ___ for the child.;The road is dry ___ to run on.;The box is big ___ for the toys.;The soup is hot ___ to eat.;The music is soft ___ for the baby.;The wall is low ___ to climb.;The water is shallow ___ to cross.;The shoes are large ___ for me.;The book is easy ___ for the first day.;The sun is low ___ to see.;The bus is empty ___ to get on.;The cake is small ___ for one person.;The hill is flat ___ to ride up.;The room is bright ___ to read in.');
  return [...too.map(q => makeQuestion(q, 'too', threeOptions('too', 'enough', 'very'))), ...enough.map(q => makeQuestion(q, 'enough', threeOptions('enough', 'too', 'very')))];
}

function howLongOften() {
  const long = words('___ have you lived here? — For five years.;___ does the class last? — Forty minutes.;___ is the river? — It is very long.;___ did you wait? — For ten minutes.;___ has she studied English? — Since Grade 3.;___ is the road? — About two kilometers.;___ will the trip take? — Two hours.;___ have they known each other? — For years.;___ is the film? — Ninety minutes.;___ did he stay there? — One week.;___ have you had this bike? — Since last year.;___ is the bridge? — One hundred meters.;___ will you be away? — Three days.;___ did the rain last? — All morning.;___ has she been at school? — Since 7:30.');
  const often = words('___ do you visit Grandma? — Every month.;___ does he play chess? — Twice a week.;___ do they go to the market? — Every Sunday.;___ does she read English? — Every night.;___ do you clean your room? — Every Friday.;___ does the club meet? — Once a week.;___ do we have art class? — Twice a week.;___ does he call his cousin? — Every weekend.;___ do they water the plants? — Every day.;___ does she swim? — Once a week.;___ do you help at home? — Every day.;___ does the bus come? — Every hour.;___ do they practice music? — Every afternoon.;___ does he feed the dog? — Every morning.;___ do you visit the library? — Twice a month.');
  return [...long.map(q => makeQuestion(q, 'How long', threeOptions('How long', 'How often', 'How many'))), ...often.map(q => makeQuestion(q, 'How often', threeOptions('How often', 'How long', 'How much')))];
}

function eachOther() {
  const rows = words('Mia and her sister help ___ with homework.;The two friends write to ___ every week.;The players pass the ball to ___.;My parents talk to ___ after dinner.;The children share books with ___.;The two dogs look at ___.;The classmates sit next to ___.;The birds call to ___.;The two farmers help ___ in the field.;My cousins call ___ on Sunday.;The singers listen to ___.;The two girls smile at ___.;The brothers teach ___ games.;The friends give ___ cards.;The two cats chase ___.;The students read to ___.;The two teachers help ___ plan.;The children wave to ___.;The sisters walk with ___.;The two boys trust ___.;The friends tell ___ stories.;The two ducks follow ___.;The players cheer for ___.;The classmates ask ___ questions.;The two neighbors visit ___.;The children draw pictures for ___.;The brothers wait for ___.;The friends send ___ letters.;The two birds fly beside ___.;The sisters talk to ___.');
  return rows.map(q => makeQuestion(q, 'each other', threeOptions('each other', 'themselves', 'himself')));
}

function sequenceWords() {
  const first = words('___, wash your hands.;___, open your book.;___, find a clean cup.;___, put the seed in the soil.;___, take out your pencil.;___, look at the map.;___, put on your shoes.;___, choose a piece of paper.');
  const next = words('___, add some water.;___, write your name.;___, put the book in your bag.;___, draw the first line.;___, mix the colors.;___, fold the paper.;___, put the bowl on the table.;___, check your answers.');
  const then = words('___, read the story.;___, color the picture.;___, carry the bag home.;___, call your friend.;___, water the plant.;___, clean the table.;___, pack your lunch.;___, walk to the gate.');
  const finalSteps = words('___, close the door.;___, put everything away.;___, eat the cake.;___, show your work to the teacher.;___, go home.;___, wash the cup.');
  return [...first.map(q => makeQuestion(q, 'First', threeOptions('First', 'Then', 'Finally'))), ...next.map(q => makeQuestion(q, 'Next', threeOptions('Next', 'First', 'Finally'))), ...then.map(q => makeQuestion(q, 'Then', threeOptions('Then', 'First', 'Finally'))), ...finalSteps.map(q => makeQuestion(q, 'Finally', threeOptions('Finally', 'First', 'Then')))];
}

// Replacements for the existing Level 3 concepts that required more advanced
// secondary-school grammar than this curriculum's Grade 5-6 audience needs.
function replacementBanks() {
  const pastTime = [
    ...words('I saw Grandma ___.;We played football ___.;She cleaned her room ___.;They visited the farm ___.;He walked home ___.;The bus arrived ___.;I finished my work ___.;The rain stopped ___.;She called her friend ___.;We ate dinner ___.').map(q => makeQuestion(q, 'yesterday', threeOptions('yesterday', 'tomorrow', 'now'))),
    ...words('We went to the park ___ Sunday.;She washed the car ___ week.;He visited his uncle ___ month.;I saw the film ___ Friday.;They planted trees ___ spring.;We had a test ___ Tuesday.;She cleaned her desk ___ night.;He walked here ___ summer.;I read that book ___ year.;They played ball ___ Saturday.').map(q => makeQuestion(q, 'last', threeOptions('last', 'next', 'every'))),
    ...words('I saw her two days ___;We moved here a year ___;She left an hour ___;He called ten minutes ___;They arrived a week ___;I ate lunch an hour ___;We met three days ___;She finished five minutes ___;He left a month ___;They planted it last spring, a season ___.').map(q => makeQuestion(q, 'ago', threeOptions('ago', 'before', 'after')))
  ];
  const requests = words('___ you help me carry this bag?;___ you open the window, please?;___ you show me the way?;___ you pass me the book?;___ you wait for me?;___ you read this word?;___ you close the door?;___ you help the new student?;___ you speak more slowly?;___ you bring some water?;___ you call your mother?;___ you move this chair?;___ you lend me a pencil?;___ you check my answer?;___ you turn on the light?;___ you help us clean up?;___ you hold this box?;___ you write your name here?;___ you take a photo for us?;___ you tell me the time?;___ you put the book away?;___ you wash this cup?;___ you look after the dog?;___ you walk with me?;___ you explain this rule?;___ you help me find my bag?;___ you bring your homework?;___ you play a song?;___ you show me your picture?;___ you wait outside?').map(q => makeQuestion(q, 'Could', threeOptions('Could', 'Did', 'Are')));
  const sayTellRows = [
    ...words('Please ___ me your name.;Can you ___ me the time?;I will ___ you a story.;She ___ her mother the news.;The teacher will ___ us the answer.;Please ___ me where the library is.;He ___ his friend a joke.;We can ___ you the way.;Dad will ___ me about the farm.;The girl will ___ us her idea.;Please ___ your sister the rule.;They will ___ us the plan.;Can you ___ me your phone number?;I will ___ you what happened.;The guide will ___ us about the museum.').map(q => makeQuestion(q, 'tell', threeOptions('tell', 'say', 'talk'))),
    ...words('Please ___ hello to your teacher.;I want to ___ thank you.;She will ___ goodbye before she leaves.;He did not ___ a word.;We can ___ yes or no.;Dad will ___ sorry.;The child will ___ good morning.;They will ___ welcome to the guests.;I want to ___ something.;The singer will ___ the words clearly.;Please ___ it again.;She will ___ her answer.;He did not ___ goodbye.;We can ___ thank you together.;The teacher will ___ stop.').map(q => makeQuestion(q, 'say', threeOptions('say', 'tell', 'speak')))
  ];
  const beforeAfterIng = [
    ...words('Wash your hands before ___ dinner.;Look both ways before ___ the road.;Pack your bag before ___ home.;Brush your teeth before ___ to bed.;Read the rules before ___ the game.;Check your work before ___ it in.;Put on your coat before ___ outside.;Wash the fruit before ___ it.;Find your book before ___ class.;Put on your shoes before ___ fast.;Say hello before ___ the teacher.;Close the gate before ___;Water the plants before ___ school.;Clean the table before ___ lunch.;Look at the map before ___ the path.').map((q, i) => makeQuestion(q, words('eating;crossing;going;going;starting;handing;going;eating;starting;running;talking;leaving;leaving;eating;choosing')[i], threeOptions(words('eating;crossing;going;going;starting;handing;going;eating;starting;running;talking;leaving;leaving;eating;choosing')[i], 'to go', 'go'))),
    ...words('We play after ___ school.;I rest after ___ lunch.;She washes the cup after ___ it.;They go home after ___ class.;We clean up after ___ the game.;He feeds the dog after ___ dinner.;Put your book away after ___;The birds rest after ___ home.;We talk after ___ the lesson.;She calls Dad after ___ school.;The cat sleeps after ___;I draw after ___ my homework.;They clap after ___ the song.;We wash up after ___;He smiles after ___ the race.').map((q, i) => makeQuestion(q, words('finishing;eating;using;finishing;playing;eating;reading;flying;finishing;finishing;eating;doing;singing;cooking;winning')[i], threeOptions(words('finishing;eating;using;finishing;playing;eating;reading;flying;finishing;finishing;eating;doing;singing;cooking;winning')[i], 'to play', 'play')))
  ];
  const shortAnswers = [
    ...words('Do you like apples? — Yes, I ___.;Does she live here? — Yes, she ___.;Did they play today? — Yes, they ___.;Can he swim? — Yes, he ___.;Are we ready? — Yes, we ___.;Is the dog hungry? — Yes, it ___.;Do the children sing? — Yes, they ___.;Does your father work here? — Yes, he ___.;Did she call you? — Yes, she ___.;Can you help me? — Yes, I ___.;Are the books new? — Yes, they ___.;Is the bus here? — Yes, it ___.;Do we have class? — Yes, we ___.;Does the cat sleep here? — Yes, it ___.;Did he finish his work? — Yes, he ___.'),
    ...words('No, I do;No, she does;No, they did;No, he can;No, we are;No, it is;No, they do;No, he does;No, she did;No, I can;No, they are;No, it is;No, we do;No, it does;No, he did')
  ];
  const shortAnswerQuestions = [
    ...[
      ['Do you like apples? — Yes, I ___.', 'do'], ['Does she live here? — Yes, she ___.', 'does'], ['Did they play today? — Yes, they ___.', 'did'], ['Can he swim? — Yes, he ___.', 'can'], ['Are we ready? — Yes, we ___.', 'are'], ['Is the dog hungry? — Yes, it ___.', 'is'], ['Do the children sing? — Yes, they ___.', 'do'], ['Does your father work here? — Yes, he ___.', 'does'], ['Did she call you? — Yes, she ___.', 'did'], ['Can you help me? — Yes, I ___.', 'can'], ['Are the books new? — Yes, they ___.', 'are'], ['Is the bus here? — Yes, it ___.', 'is'], ['Do we have class? — Yes, we ___.', 'do'], ['Does the cat sleep here? — Yes, it ___.', 'does'], ['Did he finish his work? — Yes, he ___.', 'did']
    ].map(([q, a]) => makeQuestion(q, a, [a, 'can', 'is'].filter((value, index, list) => list.indexOf(value) === index).length === 3 ? [a, 'can', 'is'] : [a, 'do', 'does'])),
    ...[
      ['Do you like apples? — No, I ___.', "don't"], ['Does she live here? — No, she ___.', "doesn't"], ['Did they play today? — No, they ___.', "didn't"], ['Can he swim? — No, he ___.', "can't"], ['Are we ready? — No, we ___.', "aren't"], ['Is the dog hungry? — No, it ___.', "isn't"], ['Do the children sing? — No, they ___.', "don't"], ['Does your father work here? — No, he ___.', "doesn't"], ['Did she call you? — No, she ___.', "didn't"], ['Can you help me? — No, I ___.', "can't"], ['Are the books new? — No, they ___.', "aren't"], ['Is the bus here? — No, it ___.', "isn't"], ['Do we have class? — No, we ___.', "don't"], ['Does the cat sleep here? — No, it ___.', "doesn't"], ['Did he finish his work? — No, he ___.', "didn't"]
    ].map(([q, a]) => makeQuestion(q, a, [a, 'do', 'does'].filter((value, index, list) => list.indexOf(value) === index).length === 3 ? [a, 'do', 'does'] : [a, 'is', 'can']))
  ];
  const mayRows = words('It ___ rain later, so take an umbrella.;She ___ come tomorrow, she is not sure.;The bus ___ be late in this rain.;He ___ need help with the box.;We ___ see ducks at the pond.;They ___ visit the farm this weekend.;The shop ___ close early today.;I ___ finish my book tonight.;The road ___ be wet after the rain.;She ___ call after class.;We ___ have a test next week.;He ___ bring his bike tomorrow.;The birds ___ fly south soon.;They ___ stay for lunch.;I ___ go to the library later.;The teacher ___ give us homework.;She ___ make a cake this weekend.;We ___ plant flowers tomorrow.;He ___ see his cousin today.;The train ___ arrive late.;They ___ play outside after lunch.;I ___ need a new pencil.;The dog ___ bark at night.;She ___ visit Grandma next month.;We ___ watch a film this evening.;He ___ bring some fruit.;They ___ go to the market.;I ___ write a letter tonight.;The child ___ fall asleep soon.;She ___ join the club.').map(q => makeQuestion(q, 'may', threeOptions('may', 'must', "can't")));
  const letsRows = words('___ make a card for our teacher.;___ go to the library.;___ clean the table.;___ play a game.;___ help the new student.;___ plant some flowers.;___ read this story.;___ walk home together.;___ make some soup.;___ draw a picture.;___ feed the ducks.;___ put the books away.;___ sing a song.;___ visit Grandma.;___ pick up the paper.;___ wash the cups.;___ find the map.;___ play outside.;___ listen to the teacher.;___ call our friend.;___ carry the boxes.;___ close the gate.;___ make a kite.;___ water the plants.;___ take a photo.;___ share the apples.;___ start the game.;___ wait for the bus.;___ look at the stars.;___ say thank you.').map(q => makeQuestion(q, "Let's", threeOptions("Let's", 'Let', 'Lets')));
  const questionOrder = [
    ...words('Where ___ you live?;What ___ they want?;When ___ we start?;Why ___ the children laugh?;How ___ you get to school?;Where ___ your friends play?;What ___ we need?;When ___ they eat lunch?;Why ___ you study English?;How ___ the birds fly?;Where ___ your parents work?;What ___ the boys need?;When ___ the buses arrive?;Why ___ the dogs bark?;How ___ your sisters get home?').map(q => makeQuestion(q, 'do', threeOptions('do', 'does', 'are'))),
    ...words('Where ___ she live?;What ___ he want?;When ___ the bus arrive?;Why ___ the dog bark?;How ___ your sister get home?;Where ___ your teacher work?;What ___ the child need?;When ___ Dad come home?;Why ___ the cat sleep here?;How ___ your brother go to school?;Where ___ the bird sit?;What ___ Mom cook?;When ___ the shop open?;Why ___ the baby cry?;How ___ the farmer work?').map(q => makeQuestion(q, 'does', threeOptions('does', 'do', 'is')))
  ];
  return { 503: pastTime, 506: requests, 508: sayTellRows, 509: beforeAfterIng, 510: shortAnswerQuestions, 511: mayRows, 514: letsRows, 515: questionOrder };
}

const newLessons = {
  '1-2': [
    withBank({ id: 216, title: { en: 'These vs Those', zh: '这些与那些' }, desc: { en: 'Talk about more than one thing that is near or far.', zh: '说多个近处或远处的东西。' }, rule: { en: "Use 'these' for things near you and 'those' for things far from you.", zh: "多个近处的东西用 these，多个远处的东西用 those。" } }, pluralDemonstratives()),
    withBank({ id: 217, title: { en: 'There Is vs There Are', zh: 'There is 与 There are' }, desc: { en: 'Say that one thing or many things are in a place.', zh: '说一个或多个东西在某个地方。' }, rule: { en: "Use 'There is' for one thing and 'There are' for more than one thing.", zh: "一个东西用 There is，多个东西用 There are。" } }, thereIsAre()),
    withBank({ id: 218, title: { en: 'Do vs Does Questions', zh: 'Do 与 Does 疑问句' }, desc: { en: 'Ask about everyday actions.', zh: '询问每天做的事情。' }, rule: { en: "Use 'Do' with I, you, we, and they. Use 'Does' with he, she, it, or one person.", zh: "I、you、we、they 用 Do；he、she、it 或一个人用 Does。" } }, doDoesQuestions()),
    withBank({ id: 219, title: { en: 'Do Not vs Does Not', zh: 'Do not 与 Does not' }, desc: { en: 'Say that someone does not do something.', zh: '说某人不做某事。' }, rule: { en: "Use 'do not' with I, you, we, and they. Use 'does not' with he, she, it, or one person.", zh: "I、you、we、they 用 do not；he、she、it 或一个人用 does not。" } }, doDoesNegatives()),
    withBank({ id: 220, title: { en: "Possessive 's", zh: '所有格 ’s' }, desc: { en: 'Show who owns something.', zh: '表示东西是谁的。' }, rule: { en: "Add 's to one person, animal, or thing to show ownership: the girl's bag.", zh: "在一个人、动物或物品后加 ’s，表示是谁的：the girl's bag。" } }, possessiveS()),
    withBank({ id: 221, title: { en: 'Next To vs Between', zh: 'Next to 与 Between' }, desc: { en: 'Tell where things are.', zh: '说东西在哪里。' }, rule: { en: "Use 'next to' for beside one thing. Use 'between' for the middle of two things.", zh: "在一个东西旁边用 next to；在两个东西中间用 between。" } }, nextToBetween()),
    withBank({ id: 222, title: { en: 'Before vs After', zh: 'Before 与 After' }, desc: { en: 'Put actions in order.', zh: '按顺序说动作。' }, rule: { en: "Use 'before' for an earlier action and 'after' for a later action.", zh: "较早的动作前用 before，较晚的动作前用 after。" } }, beforeAfter()),
    withBank({ id: 223, title: { en: 'At vs On for Time', zh: '时间中的 At 与 On' }, desc: { en: 'Talk about clock times and days.', zh: '说时间和星期。' }, rule: { en: "Use 'at' for a clock time and 'on' for a day.", zh: "具体几点用 at；星期几用 on。" } }, atOnTime()),
    withBank({ id: 224, title: { en: 'Some vs Any', zh: 'Some 与 Any' }, desc: { en: 'Talk about an amount of things.', zh: '说一些东西或数量。' }, rule: { en: "Use 'some' in positive sentences. Use 'any' in simple questions.", zh: "肯定句里常用 some；简单问句里常用 any。" } }, someAny()),
    withBank({ id: 225, title: { en: 'Can Questions', zh: 'Can 疑问句' }, desc: { en: 'Ask if someone is able to do something.', zh: '问某人会不会做某事。' }, rule: { en: "Start an ability question with 'Can': Can you swim?", zh: "询问会不会做某事时，句首用 Can：Can you swim?" } }, canQuestions())
  ],
  '3-4': [
    withBank({ id: 316, title: { en: 'Simple Present vs Now', zh: '一般现在时与现在进行时' }, desc: { en: 'Choose a daily action or an action happening now.', zh: '区分每天做的事和正在做的事。' }, rule: { en: 'Use the simple present for habits. Use am/is/are + verb-ing for an action happening now.', zh: '习惯性的动作用一般现在时；正在发生的动作用 am/is/are + 动词-ing。' } }, presentSimpleContinuous()),
    withBank({ id: 317, title: { en: 'There Was vs There Were', zh: 'There was 与 There were' }, desc: { en: 'Say what was in a place in the past.', zh: '说过去某个地方有什么。' }, rule: { en: "Use 'There was' for one thing in the past and 'There were' for more than one.", zh: "过去有一个东西用 There was；过去有多个东西用 There were。" } }, thereWasWere()),
    withBank({ id: 318, title: { en: 'Did Questions', zh: 'Did 疑问句' }, desc: { en: 'Ask about an action in the past.', zh: '询问过去发生的动作。' }, rule: { en: "Start a past-action question with 'Did' and use the base verb: Did she walk?", zh: "过去动作的问句用 Did 开头，后面动词用原形：Did she walk?" } }, didQuestions()),
    withBank({ id: 319, title: { en: "Didn't for the Past", zh: '过去时的 Didn’t' }, desc: { en: 'Say an action did not happen in the past.', zh: '说过去没有发生的动作。' }, rule: { en: "Use 'didn't' + base verb for a past action that did not happen.", zh: "过去没有发生的动作，用 didn't 加动词原形。" } }, didntPast()),
    withBank({ id: 320, title: { en: 'Want / Need + To', zh: 'Want / Need 加 To' }, desc: { en: 'Say what someone wants or needs to do.', zh: '说某人想做或需要做什么。' }, rule: { en: "Use 'want to' or 'need to' before an action word: We need to go.", zh: "想做或需要做某事，用 want to 或 need to 加动词：We need to go。" } }, wantNeedTo()),
    withBank({ id: 321, title: { en: 'How Many vs How Much', zh: 'How many 与 How much' }, desc: { en: 'Ask about the number or amount of something.', zh: '询问数量或多少。' }, rule: { en: "Use 'How many' for things you can count. Use 'How much' for things like water or rice.", zh: "可数的东西用 How many；水、米饭等不可数的东西用 How much。" } }, manyMuch()),
    withBank({ id: 322, title: { en: 'A Few vs A Little', zh: 'A few 与 A little' }, desc: { en: 'Talk about a small number or a small amount.', zh: '说少量的可数或不可数东西。' }, rule: { en: "Use 'a few' with countable things and 'a little' with water, rice, and other amounts.", zh: "可数的东西用 a few；水、米饭等不可数的东西用 a little。" } }, fewLittle()),
    withBank({ id: 323, title: { en: 'Adverbs: -ly Words', zh: '副词：-ly 词' }, desc: { en: 'Say how an action happens.', zh: '说一个动作怎样发生。' }, rule: { en: "Many action words use an -ly word: The turtle walks slowly.", zh: "表示动作怎样发生时，常用 -ly 词：The turtle walks slowly。" } }, adverbsLy()),
    withBank({ id: 324, title: { en: 'To, From, and Into', zh: 'To、From 与 Into' }, desc: { en: 'Talk about movement from one place to another.', zh: '说从一个地方到另一个地方。' }, rule: { en: "Use 'to' for a place you go to, 'from' for where you start, and 'into' for going inside.", zh: "去某地用 to；从某地来用 from；进入里面用 into。" } }, movementPrepositions()),
    withBank({ id: 325, title: { en: 'How Often', zh: 'How often' }, desc: { en: 'Ask how often an action happens.', zh: '询问一件事多久做一次。' }, rule: { en: "Use 'How often' to ask about frequency: How often do you read?", zh: "询问多久做一次，用 How often：How often do you read?" } }, howOften())
  ],
  '5-6': [
    withBank({ id: 516, title: { en: 'Used To', zh: 'Used to' }, desc: { en: 'Talk about a past habit that has changed.', zh: '说过去常做、现在可能不做的事。' }, rule: { en: "Use 'used to' + base verb for a past habit: I used to play outside.", zh: "过去常做的事用 used to 加动词原形：I used to play outside。" } }, usedTo()),
    withBank({ id: 517, title: { en: 'Would Like To', zh: 'Would like to' }, desc: { en: 'Make a polite wish or request.', zh: '礼貌地说想做什么。' }, rule: { en: "Use 'would like to' + base verb: I would like to help.", zh: "礼貌地说想做某事，用 would like to 加动词原形。" } }, wouldLikeTo()),
    withBank({ id: 518, title: { en: "Need To vs Don't Have To", zh: 'Need to 与 Don’t have to' }, desc: { en: 'Tell what is needed and what is not needed.', zh: '说需要做什么或不需要做什么。' }, rule: { en: "Use 'need to' for something necessary. Use 'don't have to' when it is not necessary.", zh: "必须做的事用 need to；不必做的事用 don't have to。" } }, needToDontHaveTo()),
    withBank({ id: 519, title: { en: 'Both ... And', zh: 'Both ... and' }, desc: { en: 'Join two people or things together.', zh: '把两个人或两样东西连在一起说。' }, rule: { en: "Use 'both ... and' to include two people or things: Both Mia and Ben are here.", zh: "同时说两个人或两样东西，用 both ... and：Both Mia and Ben are here。" } }, bothAnd()),
    withBank({ id: 520, title: { en: 'Either ... Or', zh: 'Either ... or' }, desc: { en: 'Give a choice between two things.', zh: '在两样东西中给出选择。' }, rule: { en: "Use 'either ... or' to give a choice: You can choose either tea or milk.", zh: "在两样东西中选择，用 either ... or：You can choose either tea or milk。" } }, eitherOr()),
    withBank({ id: 521, title: { en: 'Not As ... As', zh: 'Not as ... as' }, desc: { en: 'Compare two things that are different.', zh: '比较两个不一样的东西。' }, rule: { en: "Use 'not as + adjective + as' to show one thing has less of a quality.", zh: "比较两个东西时，not as 加形容词加 as 表示程度较低。" } }, notAsAs()),
    withBank({ id: 522, title: { en: 'Too vs Enough', zh: 'Too 与 Enough' }, desc: { en: 'Say when something is more or less than needed.', zh: '说某事太多或足够。' }, rule: { en: "Use 'too + adjective' for more than is needed. Use 'adjective + enough' for what is enough.", zh: "太过头用 too 加形容词；足够时用形容词加 enough。" } }, tooEnough()),
    withBank({ id: 523, title: { en: 'How Long vs How Often', zh: 'How long 与 How often' }, desc: { en: 'Ask about time length or frequency.', zh: '询问多长时间或多久一次。' }, rule: { en: "Use 'How long' for a length of time. Use 'How often' for how frequently something happens.", zh: "多长时间用 How long；多久一次用 How often。" } }, howLongOften()),
    withBank({ id: 524, title: { en: 'Each Other', zh: 'Each other' }, desc: { en: 'Talk about two or more people doing something together.', zh: '说两个人或多人相互做某事。' }, rule: { en: "Use 'each other' when people or animals do something to one another.", zh: "人或动物相互做某事时，用 each other。" } }, eachOther()),
    withBank({ id: 525, title: { en: 'First, Next, Then, Finally', zh: 'First、Next、Then、Finally' }, desc: { en: 'Show the order of steps.', zh: '表示步骤的先后顺序。' }, rule: { en: "Use 'First', 'Next', 'Then', and 'Finally' to put steps in order.", zh: "用 First、Next、Then、Finally 表示步骤顺序。" } }, sequenceWords())
  ]
};

const replacementMeta = {
  503: { title: { en: 'Past Time Words', zh: '过去时间词' }, desc: { en: 'Use simple words to say when something happened.', zh: '用简单词说事情是什么时候发生的。' }, rule: { en: "Use 'yesterday', 'last', and 'ago' to talk about the past.", zh: "说过去的事，可以用 yesterday、last 和 ago。" } },
  506: { title: { en: 'Polite Requests with Could', zh: '用 Could 礼貌请求' }, desc: { en: 'Ask someone for help politely.', zh: '礼貌地请别人帮忙。' }, rule: { en: "Start a polite request with 'Could you ...?'", zh: "礼貌请求可以用 Could you ...? 开头。" } },
  508: { title: { en: 'Say vs Tell', zh: 'Say 与 Tell' }, desc: { en: 'Choose the right word for speaking.', zh: '选择合适的说话动词。' }, rule: { en: "Use 'tell' before a person: tell me. Use 'say' before words: say hello.", zh: "后面跟人的时候用 tell：tell me；后面跟说的话时用 say：say hello。" } },
  509: { title: { en: 'Before / After + -ing', zh: 'Before / After 加 -ing' }, desc: { en: 'Connect two actions in order.', zh: '按顺序连接两个动作。' }, rule: { en: "After 'before' or 'after', use a verb ending in -ing: before eating.", zh: "before 或 after 后面的动词常用 -ing：before eating。" } },
  510: { title: { en: 'Short Answers', zh: '简短回答' }, desc: { en: 'Give a short answer to a yes-or-no question.', zh: '简短回答一般疑问句。' }, rule: { en: "Use the helping word in the question: Do you...? Yes, I do.", zh: "回答时用问句里的帮助词：Do you...? Yes, I do。" } },
  511: { title: { en: 'May for Possibility', zh: 'May 表示可能' }, desc: { en: 'Say that something is possible.', zh: '说一件事有可能发生。' }, rule: { en: "Use 'may' + base verb when something is possible: It may rain.", zh: "一件事有可能发生时，用 may 加动词原形：It may rain。" } },
  514: { title: { en: "Let's for Suggestions", zh: '用 Let’s 提建议' }, desc: { en: 'Make a friendly suggestion.', zh: '友好地提建议。' }, rule: { en: "Use 'Let's' + base verb to suggest an action: Let's read.", zh: "提建议时，用 Let's 加动词原形：Let's read。" } },
  515: { title: { en: 'Question Word Order', zh: '疑问句语序' }, desc: { en: 'Put question words in the right order.', zh: '把疑问句的词放在正确顺序。' }, rule: { en: "Use a question word + do/does + subject + base verb: Where do you live?", zh: "疑问句常用：疑问词 + do/does + 主语 + 动词原形，例如 Where do you live?" } }
};

function replaceAdvancedLessons(data) {
  const banks = replacementBanks();
  for (const lesson of data['5-6'].grammar) {
    if (!banks[lesson.id]) continue;
    if (banks[lesson.id].length !== 30) throw new Error(`Replacement lesson ${lesson.id} has ${banks[lesson.id].length} questions.`);
    const meta = replacementMeta[lesson.id];
    lesson.title = meta.title;
    lesson.desc = meta.desc;
    lesson.rule = meta.rule;
    lesson.questions = bank(banks[lesson.id]);
    delete lesson.bankQuestions;
  }
}

function makeSmallExistingFixes(data) {
  const article = data['1-2'].grammar.find(item => item.id === 201);
  article.rule = {
    en: "Use 'a' before a consonant sound (a cat) and 'an' before a vowel sound (an apple).",
    zh: "辅音发音前用 a（a cat）；元音发音前用 an（an apple）。"
  };
  const frequency = data['3-4'].grammar.find(item => item.id === 309);
  frequency.rule = {
    en: "Words like always, usually, and often say how often something happens. Put them before an action verb, but after be.",
    zh: "always、usually、often 等词表示多久做一次。它们放在动作动词前面，但放在 be 动词后面。"
  };
  const modal = data['3-4'].grammar.find(item => item.id === 314);
  modal.rule = {
    en: "Use 'must' for an important rule. Use 'should' to give friendly advice.",
    zh: "重要规则用 must；友好建议用 should。"
  };

  const wordingUpdates = {
    501: {
      en: "Use 'have/has' + a past participle to say something happened before now: I have finished.",
      zh: "用 have/has 加过去分词，表示事情在现在之前发生：I have finished。"
    },
    504: {
      en: "Use be + a past participle when the sentence is about what happened to something: The window was broken.",
      zh: "句子重点是某个东西发生了什么时，用 be 动词加过去分词：The window was broken。"
    },
    512: {
      en: "Use 'although' for two ideas that are different. Use 'because' to give a reason.",
      zh: "两个情况不同但都成立时用 although；说明原因时用 because。"
    },
    513: {
      en: "Words like everyone and each mean one at a time, so use is, has, or a verb ending in -s.",
      zh: "everyone、each 等词看作一个人或一个东西，所以用 is、has 或动词的 -s 形式。"
    },
    518: {
      en: "Use 'need to' for something you must do. Use 'don't have to' when it is okay not to do it.",
      zh: "必须做的事用 need to；不做也可以的事用 don't have to。"
    },
    521: {
      en: "Use 'not as + adjective + as' when one thing is less big, fast, or heavy than another.",
      zh: "一个东西没有另一个那么大、快或重时，用 not as 加形容词加 as。"
    },
    523: {
      en: "Use 'How long' for a length of time. Use 'How often' to ask how often an action happens.",
      zh: "多长时间用 How long；问一个动作多久做一次用 How often。"
    },
    524: {
      en: "Use 'each other' when people or animals do something to one another.",
      zh: "人或动物相互做某事时，用 each other。"
    }
  };
  for (const [id, rule] of Object.entries(wordingUpdates)) {
    const lesson = data['5-6'].grammar.find(item => item.id === Number(id));
    if (lesson) lesson.rule = rule;
  }
}

function validateAll(data) {
  for (const [grade, gradeData] of Object.entries(data)) {
    const ids = new Set();
    const titles = new Set();
    for (const lesson of gradeData.grammar ?? []) {
      if (ids.has(lesson.id)) throw new Error(`${grade} has duplicate lesson id ${lesson.id}.`);
      ids.add(lesson.id);
      if (!lesson.title?.en || !lesson.title?.zh || !lesson.desc?.en || !lesson.desc?.zh || !lesson.rule?.en || !lesson.rule?.zh) {
        throw new Error(`${lesson.id} is missing bilingual lesson text.`);
      }
      if (titles.has(lesson.title.en)) throw new Error(`${grade} has duplicate grammar title ${lesson.title.en}.`);
      titles.add(lesson.title.en);
      const lists = [lesson.questions, lesson.bankQuestions].filter(Boolean);
      for (const list of lists) {
        const seen = new Set();
        for (const item of list) {
          if (!item.q || seen.has(item.q)) throw new Error(`${lesson.id} has a duplicate or blank question.`);
          seen.add(item.q);
          if (!Array.isArray(item.options) || item.options.length !== 3 || new Set(item.options).size !== 3 || !item.options.includes(item.a)) {
            throw new Error(`${lesson.id} has invalid answer choices for: ${item.q}`);
          }
        }
      }
      if (lesson.bankQuestions && (lesson.questions.length !== 3 || lesson.bankQuestions.length !== 30)) {
        throw new Error(`${lesson.id} must have 3 lesson questions and 30 bank questions.`);
      }
    }
  }
}

function update(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  replaceAdvancedLessons(data);
  makeSmallExistingFixes(data);
  for (const [grade, additions] of Object.entries(newLessons)) {
    const existing = data[grade].grammar.filter(item => !additions.some(addition => addition.id === item.id));
    data[grade].grammar = [...existing, ...additions];
  }
  validateAll(data);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return data;
}

const outputs = FILES.map(update);
if (JSON.stringify(outputs[0]) !== JSON.stringify(outputs[1])) throw new Error('Curriculum copies are not synchronized.');
console.log('Added 30 grammar concepts (10 per grade), each with 3 lesson questions and 30 bank questions.');

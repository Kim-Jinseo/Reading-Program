// Editable starter metadata, not a date or season asserted by the source deck.
export const sampleCollection = {
  _id: 'sample-summer-2026-l2',
  season: 'summer',
  year: 2026,
  level: 2,
};

export const sampleLesson = {
  _id: 'sample-classroom-l2-1',
  collectionId: 'sample-summer-2026-l2',
  number: 1,
  title: 'Our classroom',
  titleZh: '我们的教室',
  level: 2,
  slides: [
    { id: 'sample-classroom-slide-1', alt: 'Our classroom: a classroom photo with desks, chairs, and windows. 我们的教室。' },
    { id: 'sample-classroom-slide-2', alt: 'A teacher asks, “Where are you now?” The children answer, “We are in the classroom.” 老师问地点，孩子们回答在教室里。' },
    { id: 'sample-classroom-slide-3', alt: 'Classroom word pictures: desk, chair, picture, computer, blackboard, window, fan, and white board. 教室物品单词和图片。' },
    { id: 'sample-classroom-slide-4', alt: 'A blackboard and a white board with “Is there a blackboard in your classroom?” and yes or no answers. 用 there is 描述黑板。' },
    { id: 'sample-classroom-slide-5', alt: 'Seven pictures with “Are there any pictures in your classroom?” and “Yes, there are 7 pictures.” 用 there are 描述多件物品。' },
    { id: 'sample-classroom-slide-6', alt: 'Ten desks and classroom chairs for practising “Are there any desks?” and “There are 10 desks.” 练习描述课桌和椅子。' },
    { id: 'sample-classroom-slide-7', alt: 'An illustrated classroom has a blackboard at the front, ceiling fans, desks, chairs, windows, and pictures. Describe it with “There is” or “There are”. 看图描述教室。' },
    { id: 'sample-classroom-slide-8', alt: 'Classroom word review with pictures of a desk, chair, picture, computer, blackboard, window, fan, and white board. 看图片，说单词。' },
  ],
  vocabulary: [
    {
      id: 'v1',
      prompt: 'What does “desk” mean?',
      options: [{ id: 'a', text: '课桌' }, { id: 'b', text: '椅子' }, { id: 'c', text: '窗户' }],
      correctOptionId: 'a',
      explanation: 'desk：课桌。We have desks in our classroom. 我们的教室里有课桌。',
    },
    {
      id: 'v2',
      prompt: 'What does “chair” mean?',
      options: [{ id: 'a', text: '黑板' }, { id: 'b', text: '椅子' }, { id: 'c', text: '风扇' }],
      correctOptionId: 'b',
      explanation: 'chair：椅子。We sit on chairs. 我们坐在椅子上。',
    },
    {
      id: 'v3',
      prompt: 'What does “blackboard” mean?',
      options: [{ id: 'a', text: '电脑' }, { id: 'b', text: '课桌' }, { id: 'c', text: '黑板' }],
      correctOptionId: 'c',
      explanation: 'blackboard：黑板。There is a blackboard in the classroom. 教室里有一块黑板。',
    },
    {
      id: 'v4',
      prompt: 'What does “fan” mean?',
      options: [{ id: 'a', text: '风扇' }, { id: 'b', text: '图画' }, { id: 'c', text: '椅子' }],
      correctOptionId: 'a',
      explanation: 'fan：风扇。Look at the fan in the word pictures. 看单词图片里的风扇。',
    },
  ],
  questions: [
    {
      id: 'q1',
      prompt: 'Where are the children now? Look at page 2.',
      options: [{ id: 'a', text: 'In the park. 在公园里。' }, { id: 'b', text: 'In the classroom. 在教室里。' }, { id: 'c', text: 'At home. 在家里。' }],
      correctOptionId: 'b',
      explanation: 'The children say, “We are in the classroom.” 第 2 页的孩子们说：“我们在教室里。”',
    },
    {
      id: 'q2',
      prompt: 'Who asks, “Where are you now?” Look at page 2.',
      options: [{ id: 'a', text: 'The teacher. 老师。' }, { id: 'b', text: 'The children. 孩子们。' }, { id: 'c', text: 'A dog. 一只狗。' }],
      correctOptionId: 'a',
      explanation: 'The teacher asks the question. The children answer. 第 2 页左边的老师提问，右边的孩子们回答。',
    },
    {
      id: 'q3',
      prompt: 'What is at the front of the classroom on page 7?',
      options: [{ id: 'a', text: 'A bed. 一张床。' }, { id: 'b', text: 'A tree. 一棵树。' }, { id: 'c', text: 'A blackboard. 一块黑板。' }],
      correctOptionId: 'c',
      explanation: 'There is a blackboard at the front of the classroom. 第 7 页的教室前面有一块黑板。',
    },
  ],
  speaking: {
    sentence: 'There is a blackboard in the classroom.',
    hintZh: '读一读：教室里有一块黑板。注意 blackboard（黑板）和 classroom（教室）的读音。',
  },
  writing: {
    prompt: 'Try to write three or more short sentences about your classroom. What can you see? What do you like? Why do you like it?',
    promptZh: '试着用三个或更多简单的英语句子介绍你的教室。你能看到什么？你喜欢什么？为什么喜欢？可以用下面的句子开头。',
    starters: ['There is a ...', 'There are ...', 'I like ... because ...'],
  },
};

export { sampleAssets } from './sampleLessonMedia.js';

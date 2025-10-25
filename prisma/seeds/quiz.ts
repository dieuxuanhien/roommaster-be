import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedQuizBDI() {
  console.log(`Seeding quiz BDI...`);

  await prisma.quiz.upsert({
    where: { code: 'BDI' },
    update: {},
    create: {
      code: 'BDI',
      name: 'Beck Depression Inventory - BDI',
      description:
        'Thang đánh giá trầm cảm Beck (BDI). Chọn một mô tả mà bạn cảm thấy gần giống với tình trạng của mình nhất trong một tuần trở lại đây.',
      category: 'Tâm lý',
      questions: {
        create: [
          {
            order: 1,
            text: 'Mục 1: Cảm giác buồn',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không cảm thấy buồn.' },
                { score: 1, text: 'Nhiều lúc tôi cảm thấy buồn.' },
                { score: 2, text: 'Lúc nào tôi cũng cảm thấy buồn.' },
                {
                  score: 3,
                  text: 'Tôi rất buồn hoặc rất bất hạnh đến mức không thể chịu được.'
                }
              ]
            }
          },
          {
            order: 2,
            text: 'Mục 2: Nản lòng về tương lai',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không nản lòng về tương lai.' },
                {
                  score: 1,
                  text: 'Tôi cảm thấy nản lòng về tương lai hơn trước.'
                },
                {
                  score: 2,
                  text: 'Tôi cảm thấy mình chẳng có gì mong đợi ở tương lai cả.'
                },
                {
                  score: 3,
                  text: 'Tôi cảm thấy tương lai tuyệt vọng và tình hình chỉ có thể tiếp tục xấu đi.'
                }
              ]
            }
          },
          {
            order: 3,
            text: 'Mục 3: Cảm giác thất bại',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không cảm thấy như bị thất bại.' },
                {
                  score: 1,
                  text: 'Tôi thấy mình thất bại nhiều hơn những người khác.'
                },
                {
                  score: 2,
                  text: 'Nhìn lại cuộc đời, tôi thấy mình đã có quá nhiều thất bại.'
                },
                { score: 3, text: 'Tôi cảm thấy mình là một người hoàn toàn thất bại.' }
              ]
            }
          },
          {
            order: 4,
            text: 'Mục 4: Mất hứng thú',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                {
                  score: 0,
                  text: 'Tôi còn thích thú với những điều mà trước đây tôi vẫn thường thích.'
                },
                {
                  score: 1,
                  text: 'Tôi ít thấy thích những điều mà trước đây tôi vẫn thường ưa thích.'
                },
                {
                  score: 2,
                  text: 'Tôi còn rất ít thích thú về những điều trước đây tôi vẫn thường thích.'
                },
                { score: 3, text: 'Tôi không còn chút thích thú nào nữa.' }
              ]
            }
          },
          {
            order: 5,
            text: 'Mục 5: Cảm giác tội lỗi',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi hoàn toàn không cảm thấy có tội lỗi gì ghê gớm cả.' },
                {
                  score: 1,
                  text: 'Phần nhiều những việc tôi đã làm tôi đều cảm thấy có tội.'
                },
                { score: 2, text: 'Phần lớn thời gian tôi cảm thấy mình có tội.' },
                { score: 3, text: 'Lúc nào tôi cũng cảm thấy mình có tội.' }
              ]
            }
          },
          {
            order: 6,
            text: 'Mục 6: Cảm giác bị trừng phạt',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không cảm thấy đang bị trừng phạt.' },
                { score: 1, text: 'Tôi cảm thấy có lẽ mình đang bị trừng phạt.' },
                { score: 2, text: 'Tôi mong chờ bị trừng phạt.' },
                { score: 3, text: 'Tôi cảm thấy mình đang bị trừng phạt.' }
              ]
            }
          },
          {
            order: 7,
            text: 'Mục 7: Cảm giác về bản thân',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi thấy bản thân mình vẫn như trước kia.' },
                { score: 1, text: 'Tôi không còn tin tưởng vào bản thân.' },
                { score: 2, text: 'Tôi thất vọng với bản thân.' },
                { score: 3, text: 'Tôi ghét bản thân minh.' }
              ]
            }
          },
          {
            order: 8,
            text: 'Mục 8: Nản lòng về tương lai',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không nản lòng về tương lai.' },
                {
                  score: 1,
                  text: 'Tôi cảm thấy nản lòng về tương lai hơn trước.'
                },
                {
                  score: 2,
                  text: 'Tôi cảm thấy mình chẳng có gì mong đợi ở tương lai cả.'
                },
                {
                  score: 3,
                  text: 'Tôi cảm thấy tương lai tuyệt vọng và tình hình chỉ có thể tiếp tục xấu đi.'
                }
              ]
            }
          },
          {
            order: 9,
            text: 'Mục 9: Ý nghĩ tự sát',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không có ý nghĩ tự sát.' },
                { score: 1, text: 'Tôi có ý nghĩ tự sát nhưng không thực hiện.' },
                { score: 2, text: 'Tôi muốn tự sát.' },
                { score: 3, text: 'Nêu có cơ hội tôi sẽ tự sát.' }
              ]
            }
          },
          {
            order: 10,
            text: 'Mục 10: Khóc lóc',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không khóc nhiều hơn trước kia.' },
                { score: 1, text: 'Tôi hay khóc nhiều hơn trước.' },
                { score: 2, text: 'Tôi thường khóc vì những điều nhỏ nhặt.' },
                { score: 3, text: 'Tôi thấy muốn khóc nhưng không thể khóc được.' }
              ]
            }
          },
          {
            order: 11,
            text: 'Mục 11: Bồn chồn',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không dễ bồn chồn và căng thẳng hơn thường lệ.' },
                {
                  score: 1,
                  text: 'Tôi cảm thấy dễ bồn chồn và căng thẳng hơn thường lệ.'
                },
                {
                  score: 2,
                  text: 'Tôi cảm thấy bồn chồn và căng thẳng đến mức khó có thể ngồi yên được.'
                },
                {
                  score: 3,
                  text: 'Tôi thấy rất bồn chồn và kích động đến mức phải đi lại liên tục hoặc làm việc gì đó.'
                }
              ]
            }
          },
          {
            order: 12,
            text: 'Mục 12: Mất quan tâm',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                {
                  score: 0,
                  text: 'Tôi không mất sự quan tâm đến những người xung quanh hoặc các hoạt động khác.'
                },
                {
                  score: 1,
                  text: 'Tôi ít quan tâm đến mọi người, mọi việc xung quanh hơn trước.'
                },
                {
                  score: 2,
                  text: 'Tôi mất hầu hết sự quan tâm đến mọi người, mọi việc xung quanh.'
                },
                { score: 3, text: 'Tôi không còn quan tâm đến bất kỳ điều gì nữa.' }
              ]
            }
          },
          {
            order: 13,
            text: 'Mục 13: Khó quyết định',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi quyết định mọi việc cũng tốt như trước.' },
                { score: 1, text: 'Tôi thấy khó quyết định mọi việc hơn trước.' },
                {
                  score: 2,
                  text: 'Tôi thấy khó quyết định mọi việc hơn trước rất nhiều.'
                },
                { score: 3, text: 'Tôi chẳng còn có thể quyết định được việc gì nữa.' }
              ]
            }
          },
          {
            order: 14,
            text: 'Mục 14: Cảm giác vô dụng',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không cảm thấy mình là người vô dụng.' },
                {
                  score: 1,
                  text: 'Tôi không cho rằng mình có giá trị và có ích như trước kia.'
                },
                {
                  score: 2,
                  text: 'Tôi cảm thấy mình vô dụng hơn so với những người xung quanh.'
                },
                { score: 3, text: 'Tôi thấy mình là người hoàn toàn vô dụng.' }
              ]
            }
          },
          {
            order: 15,
            text: 'Mục 15: Mất sức lực',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi thấy mình vẫn tràn đầy sức lực như trước đây.' },
                { score: 1, text: 'Sức lực của tôi kém hơn trước.' },
                { score: 2, text: 'Tôi không đủ sức lực để làm được nhiều việc nữa.' },
                { score: 3, text: 'Tôi không đủ sức lực để làm được bất cứ việc gì nữa.' }
              ]
            }
          },
          {
            order: 16,
            text: 'Mục 16: Thay đổi giấc ngủ',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                {
                  score: 0,
                  text: 'Không thấy có chút thay đổi gì trong giấc ngủ của tôi.'
                },
                { score: 1, text: 'a. Tôi ngủ hơi nhiều hơn trước.' },
                { score: 1, text: 'b. Tôi ngủ hơi ít hơn trước.' },
                { score: 2, text: 'a. Tôi ngủ nhiều hơn trước.' },
                { score: 2, text: 'b. Tôi ngủ ít hơn trước.' },
                { score: 3, text: 'a. Tôi ngủ hầu như suốt cả ngày.' },
                {
                  score: 3,
                  text: 'b. Tôi thức dậy 1-2 giờ sớm hơn trước và không thể ngủ lại được.'
                }
              ]
            }
          },
          {
            order: 17,
            text: 'Mục 17: Cáu kỉnh',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không dễ cáu kỉnh và bực bội hơn trước.' },
                { score: 1, text: 'Tôi dễ cáu kỉnh và bực bội hơn trước.' },
                {
                  score: 2,
                  text: 'Tôi dễ cáu kỉnh và bực bội hơn trước rất nhiều.'
                },
                { score: 3, text: 'Lúc nào tôi cũng dễ cáu kỉnh và bực bội.' }
              ]
            }
          },
          {
            order: 18,
            text: 'Mục 18: Thay đổi khẩu vị',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi ăn vẫn ngon miệng như trước.' },
                { score: 1, text: 'a. Tôi ăn kém ngon miệng hơn trước.' },
                { score: 1, text: 'b. Tôi ăn ngon miệng hơn trước.' },
                { score: 2, text: 'a. Tôi ăn kém ngon miệng hơn trước rất nhiều.' },
                { score: 2, text: 'b. Tôi ăn ngon miệng hơn trước rất nhiều.' },
                { score: 3, text: 'a. Tôi không thấy ngon miệng một chút nào cả.' },
                { score: 3, text: 'b. Lúc nào tôi cũng thấy thèm ăn.' }
              ]
            }
          },
          {
            order: 19,
            text: 'Mục 19: Khó tập trung',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi có thể tập trung chú ý tốt như trước.' },
                { score: 1, text: 'Tôi không thể tập trung chú ý được như trước.' },
                {
                  score: 2,
                  text: 'Tôi thấy khó tập trung chú ý lâu được vào bất kỳ điều gì.'
                },
                {
                  score: 3,
                  text: 'Tôi thấy mình không thể tập trung chú ý được vào bất kỳ điều gì nữa.'
                }
              ]
            }
          },
          {
            order: 20,
            text: 'Mục 20: Mệt mỏi',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không mệt mỏi hơn trước.' },
                { score: 1, text: 'Tôi dễ mệt mỏi hơn trước.' },
                { score: 2, text: 'Hầu như làm bất kỳ việc gì tôi cũng thấy mệt mỏi.' },
                { score: 3, text: 'Tôi quá mệt mỏi khi làm bất kỳ việc gì.' }
              ]
            }
          },
          {
            order: 21,
            text: 'Mục 21: Hứng thú tình dục',
            type: QuestionType.SINGLE_CHOICE,
            options: {
              create: [
                { score: 0, text: 'Tôi không thấy có thay đổi gì trong hứng thú tình dục.' },
                { score: 1, text: 'Tôi ít hứng thú với tình dục hơn trước.' },
                { score: 2, text: 'Hiện nay tôi rất ít hứng thú với tình dục.' },
                { score: 3, text: 'Tôi hoàn toàn mất hứng thú tình dục.' }
              ]
            }
          }
        ]
      }
    }
  });

  console.log(`Seeding quiz BDI completed.`);
}

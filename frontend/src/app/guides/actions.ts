"use server";
import prisma from "@/lib/prisma";

export async function getGuides() {
  let guides = await prisma.guide.findMany();
  
  if (guides.length === 0) {
    const EXAM_OF_CONSCIENCE = [
      {
        category: "My Relationship with God",
        questions: [
          "Have I neglected my daily prayers or the reading of Scripture?",
          "Have I attended Holy Qurbana regularly on Sundays and feast days?",
          "Have I put my trust in superstitions, astrology, or secular ideologies rather than God?",
          "Have I used the name of God, Jesus Christ, or the Saints in vain or in anger?",
          "Have I been ashamed to show myself as a Christian in public?"
        ]
      },
      {
        category: "My Relationship with Others",
        questions: [
          "Have I been disobedient or disrespectful to my parents or elders?",
          "Have I harbored hatred, anger, or a desire for revenge against anyone?",
          "Have I gossiped, judged others, or damaged someone's reputation?",
          "Have I neglected those in need when I had the capacity to help?",
          "Have I been jealous of the success or blessings of others?"
        ]
      },
      {
        category: "My Personal Integrity",
        questions: [
          "Have I lied or been deceitful in my words or actions?",
          "Have I viewed impure media or entertained impure thoughts?",
          "Have I misused my body through addiction, gluttony, or lack of care?",
          "Have I stolen, cheated, or taken what does not belong to me?",
          "Have I wasted time or been lazy in my duties (school, work, family)?"
        ]
      }
    ];

    const ORTHODOX_PRAYERS = [
      { title: "The Jesus Prayer", text: "Lord Jesus Christ, Son of God, have mercy on me, a sinner." },
      { title: "The Trisagion (Kauma)", text: "Holy art thou, O God!\nHoly art thou, Almighty!\nHoly art thou, Immortal!\n† Crucified for us, have mercy on us. (Repeat 3 times)" },
      { title: "The Lord's Prayer", text: "Our Father, who art in heaven, hallowed be thy Name; thy kingdom come; thy will be done on earth, as it is in heaven..." },
      { title: "Hail Mary", text: "Peace be with you, Mary, full of grace, the Lord is with you..." }
    ];

    await prisma.guide.createMany({
      data: [
        { title: "Examination of Conscience", type: "EXAMINATION", content: JSON.stringify(EXAM_OF_CONSCIENCE) },
        { title: "Orthodox Prayers", type: "PRAYERS", content: JSON.stringify(ORTHODOX_PRAYERS) }
      ]
    });
    guides = await prisma.guide.findMany();
  }

  const exam = guides.find(g => g.type === "EXAMINATION");
  const prayers = guides.find(g => g.type === "PRAYERS");

  return {
    examOfConscience: exam ? JSON.parse(exam.content) : [],
    orthodoxPrayers: prayers ? JSON.parse(prayers.content) : []
  };
}

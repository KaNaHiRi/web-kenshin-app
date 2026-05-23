// prisma/seed.ts
// 特定健診問診票 標準項目（厚労省準拠）

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const questions = [
    // 既往歴
    { questionCode: "7505001", questionName: "脳卒中（脳出血・脳梗塞等）",                        category: "既往歴",   displayOrder: 1 },
    { questionCode: "7505002", questionName: "心臓病（狭心症・心筋梗塞等）",                      category: "既往歴",   displayOrder: 2 },
    { questionCode: "7505003", questionName: "慢性腎臓病・腎不全",                                category: "既往歴",   displayOrder: 3 },
    { questionCode: "7505004", questionName: "貧血",                                              category: "既往歴",   displayOrder: 4 },
    { questionCode: "7505005", questionName: "糖尿病",                                            category: "既往歴",   displayOrder: 5 },
    // 服薬
    { questionCode: "7505006", questionName: "血圧を下げる薬",                                    category: "服薬",     displayOrder: 6 },
    { questionCode: "7505007", questionName: "血糖を下げる薬またはインスリン",                    category: "服薬",     displayOrder: 7 },
    { questionCode: "7505008", questionName: "コレステロールや中性脂肪を下げる薬",                category: "服薬",     displayOrder: 8 },
    // 生活習慣
    { questionCode: "7505009", questionName: "医師から飲酒を控えるよう指示されている",            category: "生活習慣", displayOrder: 9  },
    { questionCode: "7505010", questionName: "現在も喫煙している",                                category: "生活習慣", displayOrder: 10 },
    { questionCode: "7505011", questionName: "運動習慣あり（週2回以上・30分以上・1年以上）",      category: "生活習慣", displayOrder: 11 },
    { questionCode: "7505012", questionName: "1日1時間以上歩行または身体活動をしている",          category: "生活習慣", displayOrder: 12 },
    { questionCode: "7505013", questionName: "歩く速度が同年代より速い",                          category: "生活習慣", displayOrder: 13 },
    { questionCode: "7505014", questionName: "1年間で体重が3kg以上増減した",                      category: "生活習慣", displayOrder: 14 },
    { questionCode: "7505015", questionName: "毎日飲酒している",                                  category: "生活習慣", displayOrder: 15 },
    { questionCode: "7505016", questionName: "1日あたりの飲酒量（1合以上）",                      category: "生活習慣", displayOrder: 16 },
    { questionCode: "7505017", questionName: "睡眠で十分な休養が取れている",                      category: "生活習慣", displayOrder: 17 },
    { questionCode: "7505018", questionName: "食べる速度が速い",                                  category: "生活習慣", displayOrder: 18 },
    { questionCode: "7505019", questionName: "就寝前2時間以内に夕食を週3回以上とる",              category: "生活習慣", displayOrder: 19 },
    { questionCode: "7505020", questionName: "朝食を週3回以上抜く",                               category: "生活習慣", displayOrder: 20 },
    { questionCode: "7505021", questionName: "食欲がある",                                        category: "生活習慣", displayOrder: 21 },
    { questionCode: "7505022", questionName: "保健指導を受ける意思がある",                        category: "生活習慣", displayOrder: 22 },
  ];

  for (const q of questions) {
    await prisma.questionMaster.upsert({
      where: { questionCode: q.questionCode },
      update: {},
      create: { ...q, isActive: 1 },
    });
  }

  console.log("✅ 問診項目マスタ 22件 登録完了");

  // スタッフ初期アカウント
  const hashedPassword = await bcrypt.hash("admin1234", 10);
  await prisma.staff.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      hashedPassword,
      displayName: "管理者",
    },
  });
  console.log("✅ スタッフアカウント作成完了 (admin / admin1234)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

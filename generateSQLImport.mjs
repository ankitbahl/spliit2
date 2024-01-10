import { nanoid } from 'nanoid';
import csv from 'csv-parser';
import fs from 'fs';
const results = [];

const csv_file = 'ankit-b-and-ankita_2024-01-10_export.csv'
fs.createReadStream(csv_file)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    generate(results);
    // [
    //   { NAME: 'Daffy Duck', AGE: '24' },
    //   { NAME: 'Bugs Bunny', AGE: '22' }
    // ]
  });
function generate(results) {
  const out = [];
  const ankitId = '_UDudHPzVb2dAzgL_-JzC';
  const ankitaId = 'xvRgcH6r4ep7YzF09KSA6';
  const groupId = 'mV9UrER7TP3yTQJa1tNAA';
  results.forEach(expense => {
    const expenses = [];
    if (expense.Currency !== 'USD') {
      return;
    }

    if (expense['Ankit Bahl'] === '0.00' && expense['Ankita'] === '0.00') {
      return;
    }
    const paidBy = expense['Ankit Bahl'] > 0 ? ankitId : ankitaId;
    const isReimbursement = expense.Category === 'Payment' ? "TRUE" : "FALSE";
    let splitMode = 'EVENLY';
    const cost = parseInt(expense.Cost.replace('.',''));
    const expenseId = nanoid();
    if (Math.round(cost / 2) === Math.abs(parseInt(expense['Ankit Bahl'].replace('.','')))) {
      expenses.push(`INSERT INTO "ExpensePaidFor"("expenseId", "participantId", "shares") VALUES ('${expenseId}', '${ankitId}', 100)`)
      expenses.push(`INSERT INTO "ExpensePaidFor"("expenseId", "participantId", "shares") VALUES ('${expenseId}', '${ankitaId}', 100)`)
    } else {
      if (isReimbursement === 'TRUE') {
        const participant = expense['Ankit Bahl'] > 0 ? ankitaId : ankitId;
        expenses.push(`INSERT INTO "ExpensePaidFor"("expenseId", "participantId", "shares") VALUES ('${expenseId}', '${participant}', 1)`)
      } else {
        splitMode = 'BY_AMOUNT';
        // subtract cost from abs of expense + who is paying vs participant
        if (paidBy === ankitId) {
          const ankitOwed = parseInt(expense['Ankit Bahl'].replace('.',''));
          expenses.push(`INSERT INTO "ExpensePaidFor"("expenseId", "participantId", "shares") VALUES ('${expenseId}', '${ankitId}', ${cost - ankitOwed})`);
          expenses.push(`INSERT INTO "ExpensePaidFor"("expenseId", "participantId", "shares") VALUES ('${expenseId}', '${ankitaId}', ${ankitOwed})`);
        } else {
          const ankitaOwed = parseInt(expense['Ankita'].replace('.',''));
          expenses.push(`INSERT INTO "ExpensePaidFor"("expenseId", "participantId", "shares") VALUES ('${expenseId}', '${ankitId}', ${ankitaOwed})`);
          expenses.push(`INSERT INTO "ExpensePaidFor"("expenseId", "participantId", "shares") VALUES ('${expenseId}', '${ankitaId}', ${cost - ankitaOwed})`);
        }
      }
    }
    out.push(`INSERT INTO "Expense"(id, title, amount, "paidById", "groupId", "isReimbursement", "splitMode", "expenseDate") VALUES
 ('${expenseId}','${expense.Description.replace(/'/g,"''")}',${cost},'${paidBy}','${groupId}','${isReimbursement}','${splitMode}','${expense.Date}')`.replace(/\n/g, ''));
    out.push(...expenses);
  });
  console.log(out.join(";\n"));
}

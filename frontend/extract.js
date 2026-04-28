import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const files = [
    "원본 SSN 계정의 폴더 및 파일 구조 안내(PHP).pdf",
    "프로젝트관리사이트기획초안.pdf"
];

const baseDir = path.resolve("C:\\projects\\ssnproject_django");

async function extract() {
    for (const filename of files) {
        const filePath = path.join(baseDir, filename);
        const outFilePath = path.join(baseDir, filename.replace('.pdf', '.txt'));

        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            fs.writeFileSync(outFilePath, data.text, 'utf-8');
            console.log(`Successfully extracted: ${outFilePath}`);
        } catch (err) {
            console.error(`Error processing ${filename}:`, err);
        }
    }
}

extract();

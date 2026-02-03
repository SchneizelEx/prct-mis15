
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
    // 1. Load .env manually
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }

    // 2. Create Connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'test_db'
    });

    console.log('Connected to database as ID ' + connection.threadId);

    // 3. Define Data
    const subjects = [
        // Batch 17 from images (Electronics - CourseId: 7)
        // Image 2 (Electronics Specialization)
        { SujId: '20105-2001', CourseId: 7, Name: 'วงจรไฟฟ้า', E_Name: 'Electric Circuit', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2002', CourseId: 7, Name: 'อุปกรณ์อิเล็กทรอนิกส์และวงจร', E_Name: 'Electronics Devices and Circuits', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2003', CourseId: 7, Name: 'วงจรพัลส์และดิจิทัล', E_Name: 'Pulse and Digital Circuits', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2004', CourseId: 7, Name: 'เขียนแบบอิเล็กทรอนิกส์ด้วยคอมพิวเตอร์', E_Name: 'Electronics CAD', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2005', CourseId: 7, Name: 'ไมโครคอนโทรลเลอร์', E_Name: 'Microcontroller', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2006', CourseId: 7, Name: 'โปรแกรมเมเบิลลอจิกคอนโทรล', E_Name: 'Programmable Logic Control', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2007', CourseId: 7, Name: 'การเขียนโปรแกรมคอมพิวเตอร์', E_Name: 'Computer Programming', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2008', CourseId: 7, Name: 'วงจรไอซีและการประยุกต์ใช้งาน', E_Name: 'IC Circuit and Applications', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2009', CourseId: 7, Name: 'อิเล็กทรอนิกส์อุตสาหกรรม', E_Name: 'Industrial Electronics', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2010', CourseId: 7, Name: 'หุ่นยนต์เบื้องต้น', E_Name: 'Basic Robot', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2011', CourseId: 7, Name: 'เครื่องเสียง', E_Name: 'Audio Equipment', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2012', CourseId: 7, Name: 'ระบบเสียง', E_Name: 'Sound System', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2013', CourseId: 7, Name: 'อิเล็กทรอนิกส์กำลัง', E_Name: 'Power Electronics', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2014', CourseId: 7, Name: 'เครือข่ายคอมพิวเตอร์', E_Name: 'Computer Networks', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2015', CourseId: 7, Name: 'มัลติมีเดีย', E_Name: 'Multimedia', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },

        // Image 3 (Electronics Continued)
        { SujId: '20105-2016', CourseId: 7, Name: 'โทรทัศน์ระบบดิจิทัล', E_Name: 'Digital Television', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2017', CourseId: 7, Name: 'เครื่องส่งวิทยุ', E_Name: 'Radio Transmitters', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2018', CourseId: 7, Name: 'สายส่งและสายอากาศ', E_Name: 'Transmission Line and Antenna', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2019', CourseId: 7, Name: 'เครื่องรับวิทยุ', E_Name: 'Radio Receivers', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2020', CourseId: 7, Name: 'งานบริการอิเล็กทรอนิกส์', E_Name: 'Electronics Services', LecturePeriod: 0, LabPeriod: 4, Credit: 2 },
        { SujId: '20105-2021', CourseId: 7, Name: 'อินเตอร์เฟซเบื้องต้น', E_Name: 'Basic Interface', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2022', CourseId: 7, Name: 'พื้นฐานเซนเซอร์ในงานอุตสาหกรรม', E_Name: 'Basic Industrial Sensors', LecturePeriod: 1, LabPeriod: 4, Credit: 3 },
        { SujId: '20105-2023', CourseId: 7, Name: 'เครื่องมือวัดไฟฟ้าและอิเล็กทรอนิกส์', E_Name: 'Electrical and Electronic Instruments', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2024', CourseId: 7, Name: 'คณิตศาสตร์ช่างอิเล็กทรอนิกส์', E_Name: 'Electronic Mathematics', LecturePeriod: 2, LabPeriod: 0, Credit: 2 },
        { SujId: '20105-2025', CourseId: 7, Name: 'อุปกรณ์อิเล็กทรอนิกส์ในระบบรักษาความปลอดภัย', E_Name: 'Electronic Devices in Security Systems', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2026', CourseId: 7, Name: 'งานบริการคอมพิวเตอร์', E_Name: 'Computer Services', LecturePeriod: 0, LabPeriod: 4, Credit: 2 },
        { SujId: '20105-2027', CourseId: 7, Name: 'ระบบโทรศัพท์เคลื่อนที่', E_Name: 'Mobile Phone Systems', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2028', CourseId: 7, Name: 'การเขียนโปรแกรมประยุกต์บนอุปกรณ์พกพา', E_Name: 'Applied Programming for Mobile Devices', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2029', CourseId: 7, Name: 'การใช้งานแอปพลิเคชันปัญญาประดิษฐ์', E_Name: 'Using Artificial Intelligence Applications', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2030', CourseId: 7, Name: 'การเขียนโปรแกรมวิชวลเบสิคดอตเน็ต', E_Name: 'Visual Basic .NET Programming', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2031', CourseId: 7, Name: 'เซลล์แสงอาทิตย์และการประยุกต์ใช้งาน', E_Name: 'Solar Cells and Applications', LecturePeriod: 1, LabPeriod: 3, Credit: 2 },
        { SujId: '20105-2032', CourseId: 7, Name: 'โครงงานด้านอิเล็กทรอนิกส์', E_Name: 'Electronics Project', LecturePeriod: 0, LabPeriod: 12, Credit: 4 },

        // Image 4 (Projects)
        { SujId: '20105-2033', CourseId: 7, Name: 'โครงงานด้านอิเล็กทรอนิกส์ 1', E_Name: 'Electronics Project 1', LecturePeriod: 0, LabPeriod: 6, Credit: 2 },
        { SujId: '20105-2034', CourseId: 7, Name: 'โครงงานด้านอิเล็กทรอนิกส์ 2', E_Name: 'Electronics Project 2', LecturePeriod: 0, LabPeriod: 6, Credit: 2 }
    ];

    // 4. Insert Data
    const sql = `
        INSERT INTO aca_subject (SujId, CourseId, Name, E_Name, LecturePeriod, LabPeriod, Credit)
        VALUES ?
        ON DUPLICATE KEY UPDATE
        Name = VALUES(Name),
        E_Name = VALUES(E_Name),
        LecturePeriod = VALUES(LecturePeriod),
        LabPeriod = VALUES(LabPeriod),
        Credit = VALUES(Credit)
    `;

    const values = subjects.map(s => [
        s.SujId, s.CourseId, s.Name, s.E_Name, s.LecturePeriod, s.LabPeriod, s.Credit
    ]);

    try {
        const [result] = await connection.query(sql, [values]);
        console.log('Insert/Update successful!');
        console.log('Affected rows:', result.affectedRows);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        await connection.end();
    }
}

main();

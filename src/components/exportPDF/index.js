import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import ko thoda change kiya

export const exportToPDF = (allLogs) => {
    const doc = new jsPDF();

    // 1. Grouping Logic
    const grouped = allLogs.reduce((groups, log) => {
        const dateObj = new Date(log.date);
        const monthYear = dateObj.toLocaleString("default", { month: "long", year: "numeric" });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(log);
        return groups;
    }, {});

    // 2. Title & Header
    doc.setFontSize(18);
    doc.text("Qaza Namaz History Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableRows = [];

    // 3. Building Rows
    Object.entries(grouped).forEach(([month, monthLogs]) => {
        // Month Header Row
        tableRows.push([
            {
                content: month,
                colSpan: 6,
                styles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' }
            }
        ]);

        monthLogs.forEach(log => {
            tableRows.push([
                log.date,
                log.data.fajr || 0,
                log.data.zohar || 0,
                log.data.asar || 0,
                log.data.maghrib || 0,
                log.data.isha || 0
            ]);
        });
    });

    // 4. Generate Table (ASAN TAREEYA)
    // doc.autoTable ki bajaye seedha autoTable function use karein
    autoTable(doc, {
        startY: 35,
        head: [['Date', 'Fajr', 'Zohar', 'Asar', 'Maghrib', 'Isha']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 9, halign: 'center' },
        columnStyles: { 0: { halign: 'left' } }
    });

    doc.save(`Qaza_History.pdf`);
};
import * as XLSX from 'xlsx';

/**
 * 导出Excel文件的通用方法
 * @param data 要导出的数据数组
 * @param columns 列配置，格式：[{ title: '列标题', key: '数据字段' }]
 * @param fileName 文件名（不含扩展名）
 */
export function exportToExcel(
  data: any[],
  columns: { title: string; key: string }[],
  fileName: string = 'export'
) {
  if (!data || data.length === 0) {
    throw new Error('没有可导出的数据');
  }

  // 将数据转换为导出格式
  const exportData = data.map(item => {
    const row: any = {};
    columns.forEach(col => {
      row[col.title] = item[col.key] ?? '';
    });
    return row;
  });

  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(exportData);

  // 设置列宽（可选）
  const colWidths = columns.map(col => ({
    wch: Math.max(col.title.length * 2, 15), // 根据标题长度设置列宽
  }));
  ws['!cols'] = colWidths;

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // 生成文件名（带时间戳）
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fullFileName = `${fileName}_${timestamp}.xlsx`;

  // 导出文件
  XLSX.writeFile(wb, fullFileName);
}

/**
 * 从对象数组导出Excel（简化版）
 * @param data 数据数组
 * @param fileName 文件名
 */
export function simpleExportToExcel(data: any[], fileName: string = 'export') {
  if (!data || data.length === 0) {
    throw new Error('没有可导出的数据');
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fullFileName = `${fileName}_${timestamp}.xlsx`;

  XLSX.writeFile(wb, fullFileName);
}

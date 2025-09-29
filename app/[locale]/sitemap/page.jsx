import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

export default async function XMLContentPage() {
  // Define the file path
  const filePath = path.join(process.cwd(), 'public', 'assets', 'sitemap.xml');

  // Read the XML file
  const xmlData = fs.readFileSync(filePath, 'utf-8');

  // Initialize the XML parser
  const parser = new XMLParser();

  // Parse the XML file into JSON
  const parsedData = parser.parse(xmlData);

  return (
    <div style={{ padding: '20px' }}>
      <h1>XML Content</h1>
      <pre>{JSON.stringify(parsedData, null, 2)}</pre>
    </div>
  );
}

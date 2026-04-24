import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './App.css';

const CSSBullseye = () => (
  <div className="css-bullseye">
    <div className="bullseye-outer"></div>
    <div className="bullseye-middle"></div>
    <div className="bullseye-inner"></div>
  </div>
);

const defaultStoreDetails = {
  store_number: "2389",
  store_city: "LOS ANGELES",
  address_line1: "7100 SANTA MONICA BLVD",
  city: "WEST HOLLYWOOD",
  state: "CA",
  zip_code: "90046",
  phone: "(323) 882-0100",
  reg_number: "03",
  cashier_name: "SARAH M",
  tran_number: "1547",
  str_number: "2389",
  tax_rate: "9.5"
};

const defaultItems = [
  { id: 1, name: "TIDE PODS 42CT", price: 14.99 },
  { id: 2, name: "BOUNTY PAPER TOWELS 6PK", price: 19.98 },
  { id: 3, name: "COFFEE MAKER BLACK", price: 39.99 },
  { id: 4, name: "ORGANIC MILK GALLON", price: 17.97 },
  { id: 5, name: "CHEERIOS CEREAL", price: 3.49 },
  { id: 6, name: "DOVE BODY WASH", price: 11.98 }
];

const generateBarcodeBars = (number) => {
  const tripled = number + number + number;
  const digits = tripled.split('').map(d => parseInt(d));
  const bars = [];
  const patterns = [[1,0,1,0,0,1,1,0,1],[0,0,1,1,0,0,1,1,0],[0,1,0,0,1,1,0,0,1],[1,0,0,1,1,0,0,1,0],[0,1,1,0,0,1,0,1,0],[1,1,0,0,1,0,1,0,0],[0,0,1,0,1,0,1,1,0],[1,0,1,1,0,0,1,0,0],[0,1,0,1,0,1,0,1,1],[1,1,0,1,0,1,0,0,1]];
  let x = 5;
  const mod = 268 / (digits.length * 9 + 5);
  digits.forEach(d => {
    patterns[d].forEach(bit => {
      if (bit) bars.push({x, width: mod * 0.9, height: 40});
      x += mod;
    });
    x += mod * 0.3;
  });
  return bars;
};

const App = () => {
  const [store, setStore] = useState(defaultStoreDetails);
  const [items, setItems] = useState(defaultItems);
  const [receiptNum, setReceiptNum] = useState(null);

  const calc = () => {
    const sub = items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
    const tax = sub * (parseFloat(store.tax_rate) || 0) / 100;
    return {sub, tax, total: sub + tax};
  };

  const {sub, tax, total} = calc();
  const redcard = {pct: "5", today: (total * 0.05).toFixed(2), ytd: "234.67"};

  const fmtDate = () => new Date().toLocaleString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true}).replace(/,/g, '').toUpperCase();

  const genSurvey = () => `${store.store_number}-${store.tran_number}-${store.reg_number}-${Math.floor(1000 + Math.random() * 9000)}`;

  const save = async () => {
    try {
      await fetch('http://localhost:5000/api/receipts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...store, items, redcard, date: fmtDate(), survey: genSurvey()})
      });
    } catch (e) {}
    setReceiptNum(Date.now().toString().slice(-6));
  };

  // FIXED PDF FUNCTION - captures exact width without misalignment
  const downloadPDF = async () => {
    const div = document.querySelector('.receipt-container');
    if (!div) return;
    
    try {
      // Capture at exact device pixel ratio for sharpness
      const canvas = await html2canvas(div, {
        scale: window.devicePixelRatio || 2,
        backgroundColor: '#FFFFFF',
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: div.offsetWidth,
        height: div.offsetHeight,
        windowWidth: div.offsetWidth,
        windowHeight: div.offsetHeight
      });
      
      // PDF dimensions match exact receipt dimensions in mm (80mm width standard thermal)
      const receiptWidthMm = 80;
      const receiptHeightMm = (canvas.height / canvas.width) * receiptWidthMm;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [receiptWidthMm, receiptHeightMm + 2] // Add tiny margin
      });
      
      // Center the image perfectly
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, receiptWidthMm, receiptHeightMm);
      
      pdf.save(`target_receipt_${receiptNum || 'preview'}.pdf`);
    } catch (e) { 
      console.error('PDF generation failed:', e);
    }
  };

  const heavy = "========================================";
  const light = "----------------------------------------";

  return (
    <div className="app-container">
      <header className="app-header"><h1>Target Receipt Generator</h1></header>
      <div className="main-content">
        <div className="builder-panel">
          <h2>Receipt Builder</h2>
          <div className="form-section">
            <h3>Store</h3>
            <input value={store.store_number} onChange={e => setStore({...store, store_number: e.target.value})} placeholder="Store #" />
            <input value={store.store_city} onChange={e => setStore({...store, store_city: e.target.value.toUpperCase()})} placeholder="City" />
            <input value={store.address_line1} onChange={e => setStore({...store, address_line1: e.target.value.toUpperCase()})} placeholder="Address" />
            <input value={store.city} onChange={e => setStore({...store, city: e.target.value.toUpperCase()})} placeholder="City" />
            <input value={store.state} onChange={e => setStore({...store, state: e.target.value.toUpperCase()})} maxLength="2" placeholder="ST" />
            <input value={store.zip_code} onChange={e => setStore({...store, zip_code: e.target.value})} maxLength="5" placeholder="ZIP" />
            <input value={store.phone} onChange={e => setStore({...store, phone: e.target.value})} placeholder="Phone" />
            <h3>Register</h3>
            <input value={store.reg_number} onChange={e => setStore({...store, reg_number: e.target.value})} placeholder="Reg #" />
            <input value={store.cashier_name} onChange={e => setStore({...store, cashier_name: e.target.value.toUpperCase()})} placeholder="Cashier" />
            <input value={store.tran_number} onChange={e => setStore({...store, tran_number: e.target.value})} placeholder="Tran #" />
            <input value={store.tax_rate} onChange={e => setStore({...store, tax_rate: e.target.value})} placeholder="Tax %" />
            <h3>Items</h3>
            {items.map((item, i) => (
              <div key={item.id} className="item-row">
                <input value={item.name} onChange={e => {const n = [...items]; n[i].name = e.target.value.toUpperCase(); setItems(n);}} placeholder="Item" />
                <input type="number" step="0.01" value={item.price} onChange={e => {const n = [...items]; n[i].price = parseFloat(e.target.value) || 0; setItems(n);}} placeholder="Price" />
                <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
            <button onClick={() => setItems([...items, {id: Date.now(), name: '', price: 0}])} className="add-btn">+ Add Item</button>
            <div style={{margin: '10px 0', fontSize: '12px'}}>
              <b>Subtotal:</b> ${sub.toFixed(2)} | <b>Tax:</b> ${tax.toFixed(2)} | <b>Total:</b> ${total.toFixed(2)}
            </div>
            <div style={{margin: '5px 0', fontSize: '11px', color: '#666'}}>
              RedCard Savings: ${redcard.today}
            </div>
            <div className="actions">
              <button onClick={save} className="primary-btn">Generate Receipt</button>
              <button onClick={downloadPDF} className="secondary-btn">Download PDF</button>
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <div className="receipt-container">
            <CSSBullseye />
            <div className="store-name">TARGET</div>
            <div className="store-info">
              <div>STORE #{store.store_number} - {store.store_city}</div>
              <div>{store.address_line1}</div>
              <div>{store.city}, {store.state} {store.zip_code}</div>
              <div>{store.phone}</div>
            </div>
            <pre className="separator-heavy">{heavy}</pre>
            <div className="date-time">{fmtDate()}</div>
            <pre className="register-info">{`REG        ${store.reg_number}   CSHR   ${store.cashier_name}\nTRAN     ${store.tran_number}   STR    ${store.str_number}`}</pre>
            <pre className="separator-light">{light}</pre>
            <div className="items-section">
              {items.map((it, idx) => (
                <div key={idx} className="item-line">
                  <span className="item-name">{it.name}</span>
                  <span className="item-price">${it.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <pre className="separator-heavy">{heavy}</pre>
            <pre className="separator-heavy">{heavy}</pre>
            <div className="totals-section">
              <div className="total-line"><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
              <div className="total-line"><span>Tax ({store.tax_rate}%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="total-line total-bold"><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div className="redcard-section">
              <div>YOUR REDCARD SAVINGS {redcard.pct}%</div>
              <div>TODAY'S SAVINGS: ${redcard.today}</div>
              <div>YTD SAVINGS: ${redcard.ytd}</div>
            </div>
            <pre className="separator-light">{light}</pre>
            <div className="return-policy">
              <div className="return-title">RETURN POLICY</div>
              <div className="return-text">
                MOST UNOPENED ITEMS IN NEW<br/>
                CONDITION RETURNED<br/>
                WITHIN 90 DAYS WILL RECEIVE<br/>
                A REFUND. SOME ITEMS<br/>
                HAVE A MODIFIED RETURN POLICY.<br/>
                VISIT TARGET.COM/<br/>
                RETURNS
              </div>
            </div>
            <pre className="separator-heavy">{heavy}</pre>
            <div className="barcode-section">
              <svg className="barcode-svg" viewBox="0 0 278 45">
                {generateBarcodeBars('70369258').map((b, i) => <rect key={i} x={b.x} y="2" width={b.width} height="40" fill="#000"/>)}
              </svg>
              <div className="barcode-number">70369258</div>
            </div>
            <div className="survey-section">
              <div>TELL US ABOUT YOUR VISIT TODAY</div>
              <div className="survey-url">TARGET.COM/SURVEY</div>
              <div className="survey-id">ID: {genSurvey()}</div>
            </div>
            <div className="footer">THANK YOU FOR SHOPPING AT TARGET</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;


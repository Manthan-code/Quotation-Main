import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, Download, ArrowLeft, FileText, Calendar, MapPin, User } from "lucide-react";
import api from "../api";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo.png";

const FONT = { fontFamily: "Times New Roman, serif" };

export default function QuotationPrint() {
  const { id } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState(null);
  const [err, setErr] = useState(null);
  const ref = useRef();
  const [lists, setLists] = useState({
    glasses: [],
    finishes: [],
    locks: [],
    rails: [],
  });
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLabel = (list, id, key = "title") =>
    list.find(item => item._id === id)?.[key] || id;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [{ data: quotation }, { data: glasses }, { data: finishes }, { data: locks }, { data: aluminium }] =
          await Promise.all([
            api.get(`/quotationEditor/${id}`),
            api.get("/glass"),
            api.get("/finish"),
            api.get("/locks"),
            api.get("/aluminium")
          ]);

        const rails = aluminium.filter(a =>
          (a.model || "").toLowerCase().includes("rail")
        );

        const allProjects = await api.get("/projects");
        const foundProject = allProjects.data.find(p => p._id === quotation.header.projectId);
        if (foundProject) {
          setProject(foundProject);
        }

        setLists({
          glasses,
          finishes,
          locks,
          rails,
        });

        setQ(quotation);
      } catch (err) {
        console.error("Failed to load data", err);
        setErr("Failed to load quotation data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const downloadPDF = () => {
    if (ref.current) {
      html2pdf().from(ref.current)
        .set({ 
          margin: [15, 10, 15, 10],
          filename: `quotation_${id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Quotation</h2>
          <p className="text-red-600 font-medium mb-6">{err}</p>
          <button 
            onClick={() => nav(-1)} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !q || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading quotation data...</p>
        </div>
      </div>
    );
  }

  const shortId = id.slice(-6);
  const quotationDate = q.createdAt ? new Date(q.createdAt) : new Date();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Bar - Hidden in print */}
      <div className="print:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => nav(`/quotation/${id}`)} 
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Editor
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={18} />
                <span className="font-medium">Quotation #{shortId}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint} 
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Printer size={16} /> Print
              </button>
              <button 
                onClick={downloadPDF} 
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6 print:p-0 print:max-w-none">
        {/* Preview Card - Hidden in print */}
        <div className="print:hidden bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Quotation Preview</h1>
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{quotationDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{project?.contactName || "Client"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{project?.address || q.header?.clientCity || "Address"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">#{shortId}</div>
                <div className="text-blue-100">Quote Number</div>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={ref} className="printable bg-white p-8 border border-gray-300 rounded-lg shadow-lg" style={{ ...FONT, maxWidth: "210mm", margin: "0 auto" }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0066b3] tracking-wider uppercase">A C C O R R</h1>
            <p className="text-sm text-gray-600 leading-5 mt-2">
              Plot No. 35-37 & 68-70, Samruddhi Corporation,<br />
              Opp. Dastan Residence, Bagumara Gaam,<br />
              Kadodara Bardoli Road, Kadodara,<br />
              Surat-394310, Gujarat, India<br />
              <span className="font-medium">M:</span> +91-9825307189, +91-9879241002<br />
              <span className="font-medium">E:</span> mihir@accorr.in, suresh@accorr.in
            </p>
          </div>
          <img src={logo} alt="Accorr Logo" className="h-24 object-contain" style={{ maxWidth: "100px" }} />
        </div>

        <hr className="my-4 border-gray-300" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Quotation</h2>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">To:</span> {project?.contactName || "Client"}<br />
              <span className="font-medium">Address:</span> {project?.address || q.header?.clientCity || "Address"}
            </p>
          </div>
          <div className="text-right text-sm text-gray-700">
            <p><span className="font-medium">Quote No.:</span> <span className="font-bold">{shortId}</span></p>
            <p><span className="font-medium">Date:</span> <span className="font-bold">{quotationDate.toLocaleDateString()}</span></p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Dear Sir/Madam,<br />
          We thank you for giving us an opportunity to quote for the following items:
        </p>

        <table className="w-full text-xs border-collapse border border-gray-300 mb-6">
          <thead className="bg-gray-100">
            <tr>
              {["Sr No.", "Width (mm)", "Height (mm)", "Series", "Typology", "Glass", "QTY", "Sq.Mtr", "Rate / Sq.Mtr", "Amount"].map((h, i) => (
                <th key={i} className="border border-gray-300 p-2 font-semibold text-gray-800">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border border-gray-300 text-center p-2">{i + 1}</td>
                <td className="border border-gray-300 text-center p-2">{r.widthMM || "0"}</td>
                <td className="border border-gray-300 text-center p-2">{r.heightMM || "0"}</td>
                <td className="border border-gray-300 text-center p-2">{r.series || "N/A"}</td>
                <td className="border border-gray-300 text-center p-2">{r.typology || "N/A"}</td>
                <td className="border border-gray-300 text-center p-2">{getLabel(lists.glasses, r.glass)}</td>
                <td className="border border-gray-300 text-center p-2">{r.qty || "1"}</td>
                <td className="border border-gray-300 text-center p-2">{r.sqmtr || r.sqmt || r.sqm || r.sqMtr || "0.00"}</td>
                <td className="border border-gray-300 text-center p-2">{r.rateSqMtr || r.rateSqM || "0.00"}</td>
                <td className="border border-gray-300 text-center p-2">{r.amount || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-full mb-8">
          <table className="text-sm text-right w-full">
            <tbody>
              <tr>
                <td className="font-semibold text-gray-800 py-1 pr-2 pl-80">Total Before Tax:</td>
                <td className="font-semibold text-gray-800">{q.totalAmt?.toFixed(2) || "0.00"}</td>
              </tr>
              {q.header?.location === "gujarat" ? (
                <>
                  <tr>
                    <td className="text-gray-700 py-1 pr-2">CGST ({q.header.cgst}%):</td>
                    <td className="text-gray-800">{((q.totalAmt || 0) * (q.header.cgst || 0) / 100).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 py-1 pr-2">SGST ({q.header.sgst}%):</td>
                    <td className="text-gray-800">{((q.totalAmt || 0) * (q.header.sgst || 0) / 100).toFixed(2)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="text-gray-700 py-1 pr-2">IGST ({q.header.igst}%):</td>
                  <td className="text-gray-800">{((q.totalAmt || 0) * (q.header.igst || 0) / 100).toFixed(2)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-400">
                <td className="font-bold text-gray-800 py-1 pr-2">GRAND TOTAL:</td>
                <td className="font-bold text-gray-800">{q.grand || "0.00"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-600 mb-8">
          <p className="font-bold">Terms & Conditions:</p>
          <ol className="list-decimal pl-5 mt-2">
            <li>Prices are inclusive of all taxes.</li>
            <li>Validity: 30 days from date of quotation.</li>
            <li>Delivery: 4-6 weeks after order confirmation.</li>
            <li>Payment: 50% advance with order, 50% before dispatch.</li>
          </ol>
        </div>

        <div className="flex justify-between items-end text-sm text-gray-600">
          <div>
            <p className="font-semibold">For ACCORR</p>
            <div className="mt-12">
              <p>Authorized Signatory</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">Customer Acceptance</p>
            <div className="mt-12">
              <p>Signature</p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable,
          .printable * {
            visibility: visible;
          }
          .printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border-radius: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { ArrowLeft } from "lucide-react";

export default function MTOPage() {
  const { id } = useParams(); 
  const nav = useNavigate();
  const [mto, setMto] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/mto/${id}`)
      .then((res) => {
        console.log("✅ MTO data:", res.data);
        setMto(res.data);
      })
      .catch(() => setError("No MTO found. Click below to generate one."));
  }, [id]);

  const handleGenerate = async () => {
    try {
      const { data } = await api.post(`/mto/generate/${id}`);
      setMto(data);
      setError(""); 
      console.log("✅ MTO generated:", data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate MTO");
    }
  };

  const groupItems = (items = []) => {
    const map = {};
    for (const item of items) {
      const parts = item.label.split(" • ");
      const group = parts[0] || "OTHERS";
      const name = parts[1] || item.label;
      if (!map[group]) map[group] = [];
      map[group].push({ ...item, name });
    }
    return map;
  };

  const grouped = groupItems(mto?.items);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Material Take-Off (MTO)</h1>
        <button
          onClick={() => nav(-1)}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate MTO
          </button>
        </div>
      )}

      {mto && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h2 className="font-bold text-lg mb-2 underline">{group}</h2>
              <table className="w-full border text-sm mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 w-12 text-center">SrNo.</th>
                    <th className="border px-2 py-1 w-[80%] ">Material</th>
                    <th className="border px-2 py-1 w-[10%] text-center">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1 w-12 text-center">{idx + 1}</td>
                      <td className="border px-2 py-1 w-[80%]">{item.name}</td>
                      <td className="border px-2 py-1 w-[10%] text-center">{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
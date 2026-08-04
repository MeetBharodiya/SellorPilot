"use client";

import TopBar from "@/components/layout/TopBar";
import { Truck, Plus, Edit3, Trash2, Globe, Clock, ChevronRight } from "lucide-react";

const mockProfiles = [
  { id: "1", name: "Standard India Shipping", origin: "India", processingMin: 1, processingMax: 3, destinations: [{ region: "United States", primary: 4.99, secondary: 2.00 }, { region: "United Kingdom", primary: 6.99, secondary: 2.50 }, { region: "Everywhere Else", primary: 8.99, secondary: 3.00 }], listingsCount: 4 },
  { id: "2", name: "Express Shipping", origin: "India", processingMin: 1, processingMax: 2, destinations: [{ region: "United States", primary: 12.99, secondary: 5.00 }, { region: "United Kingdom", primary: 14.99, secondary: 6.00 }], listingsCount: 2 },
  { id: "3", name: "Free Shipping (US Only)", origin: "India", processingMin: 2, processingMax: 5, destinations: [{ region: "United States", primary: 0.00, secondary: 0.00 }], listingsCount: 0 },
];

export default function ShippingPage() {
  return (
    <>
      <TopBar
        title="Shipping Profiles"
        subtitle={`${mockProfiles.length} profiles configured`}
        actions={
          <button className="btn btn-primary btn-sm">
            <Plus size={14} />
            New Profile
          </button>
        }
      />
      <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        {mockProfiles.map(profile => (
          <div key={profile.id} className="glass" style={{ overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "hsl(var(--brand-primary) / 0.12)", border: "1px solid hsl(var(--brand-primary) / 0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={16} color="hsl(var(--brand-primary))" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{profile.name}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 2, fontSize: 12, color: "hsl(var(--text-muted))" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Globe size={11} />Ships from {profile.origin}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{profile.processingMin}–{profile.processingMax} business days</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>📦 {profile.listingsCount} listing{profile.listingsCount !== 1 ? "s" : ""} using this</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm"><Edit3 size={12} />Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: "hsl(var(--status-error) / 0.7)" }}><Trash2 size={12} /></button>
              </div>
            </div>

            {/* Destinations table */}
            <table className="table-base">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>First Item Cost</th>
                  <th>Additional Item</th>
                </tr>
              </thead>
              <tbody>
                {profile.destinations.map((dest, i) => (
                  <tr key={i}>
                    <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Globe size={13} color="hsl(var(--text-muted))" />
                      <span style={{ fontSize: 13, color: "hsl(var(--text-primary))" }}>{dest.region}</span>
                    </td>
                    <td>
                      <span className="font-display" style={{ fontWeight: 700, color: dest.primary === 0 ? "hsl(var(--status-success))" : "hsl(var(--text-primary))" }}>
                        {dest.primary === 0 ? "FREE" : `$${dest.primary.toFixed(2)}`}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "hsl(var(--text-secondary))" }}>
                        {dest.secondary === 0 ? "FREE" : `$${dest.secondary.toFixed(2)}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Empty state + create prompt */}
        <div style={{ border: "2px dashed hsl(var(--bg-border))", borderRadius: 12, padding: "30px 20px", textAlign: "center", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "hsl(var(--brand-primary) / 0.4)") }
          onMouseLeave={e => (e.currentTarget.style.borderColor = "hsl(var(--bg-border))") }
        >
          <Plus size={20} color="hsl(var(--text-muted))" style={{ margin: "0 auto 8px", display: "block" }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-muted))" }}>Add Shipping Profile</div>
          <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 4 }}>Create reusable shipping templates and apply them across multiple listings</div>
        </div>
      </div>
    </>
  );
}

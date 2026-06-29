import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AssetForm } from "@/components/assets/asset-form";

export const metadata = { title: "Edit Asset" };

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Asset</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {asset.assetTag} — {asset.name}
        </p>
      </div>
      <AssetForm
        assetId={asset.id}
        defaultValues={{
          assetTag: asset.assetTag,
          classification: asset.classification ?? "",
          name: asset.name,
          category: asset.category as never,
          brand: asset.brand ?? "",
          model: asset.model ?? "",
          serialNumber: asset.serialNumber ?? "",
          purchaseDate: asset.purchaseDate?.toISOString().slice(0, 10) ?? "",
          purchasePrice: asset.purchasePrice ? Number(asset.purchasePrice) : undefined,
          supplier: asset.supplier ?? "",
          invoiceNumber: asset.invoiceNumber ?? "",
          paymentReference: asset.paymentReference ?? "",
          staffInCharge: asset.staffInCharge ?? "",
          location: asset.location ?? "",
          status: asset.status as never,
          notes: asset.notes ?? "",
        }}
      />
    </div>
  );
}

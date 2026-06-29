import { AssetForm } from "@/components/assets/asset-form";

export const metadata = { title: "Add Asset" };

export default function NewAssetPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Asset</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Register a new asset in the asset register
        </p>
      </div>
      <AssetForm />
    </div>
  );
}

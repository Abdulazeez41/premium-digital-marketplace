import { MediaUploadForm } from "@/components/forms/media-upload-form";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminMediaUploadPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Upload media
        </h1>
        <MediaUploadForm />
      </CardContent>
    </Card>
  );
}

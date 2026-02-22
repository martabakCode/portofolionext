import { ProjectsService } from "@/modules/projects/projects.service";
import { EditProjectForm } from "./EditProjectForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const service = new ProjectsService();
    const project = await service.getProjectById(params.id);

    if (!project) notFound();

    return <EditProjectForm project={project} />;
}

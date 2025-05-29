// import {Skeleton} from "antd";
// import useSWR from "swr";

// import {ErrorAlert} from "@/client/components/atoms/ErrorAlert";
// import MarkdownDisplay from "@/client/components/atoms/MarkdownDisplay";
// import {apiServices} from "@/client/services";
// import {ArtifactDto} from "@/openapi/client";

// type TaskScriptReadmeProps = {
// 	artifact: ArtifactDto;
// };

// const TaskScriptReadme: React.FC<TaskScriptReadmeProps> = ({artifact}) => {
// 	const {data, isLoading, error} = useSWR(["taskscript-readme", artifact], (key) => {
// 		return apiServices.TaskScriptsHelper.getReadme(key[1]);
// 	});

// 	const content = data?.data.content || "";

// 	if (isLoading) {
// 		return <Skeleton loading={isLoading} active />;
// 	}
// 	if (error) {
// 		return <ErrorAlert error={error} title="Failed to load readme" />;
// 	}
// 	return <MarkdownDisplay markdown={content} />;
// };

// export default TaskScriptReadme;

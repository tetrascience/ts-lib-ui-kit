// import { MouseEventHandler, useCallback, useState } from "react";
// import { useReactFlow } from "@xyflow/react";
// import { App, Button, Card, Flex, Input, List, Space } from "antd";
// import { AxiosError } from "axios";
// import _ from "lodash";
// import useSWR from "swr";
// import {
//   SelectableList,
//   SelectableListItem,
// } from "@/client/components/SelectableList";
// import { useSimpleModal } from "@/client/components/SimpleModal";
// import { TaskScriptNode } from "@/client/features/pipeline-builder/components/nodes";
// import apiServices from "@/client/services/apiService";
// import { useTemplateStore } from "@/client/store";
// import { TaskScriptObject } from "@/openapi/client";
// import TaskScriptReadme from "./TaskScriptReadme";

// export const TaskScriptListItem = ({
//   item,
//   onReadMeClick,
// }: {
//   item: SelectableListItem<TaskScriptObject>;
//   onReadMeClick: MouseEventHandler<HTMLElement>;
//   onClick?: MouseEventHandler<HTMLElement>;
// }) => {
//   const { addNodes, getViewport, getNodes } = useReactFlow();
//   const { selectedTemplate } = useTemplateStore();

//   const onAddNode = useCallback(
//     async (item: TaskScriptObject) => {
//       const nodeId = item.slug + "_" + (getNodes().length + 1).toString();
//       const resp = await apiServices.TontaskScriptsHelper.getBuild(item);
//       const functions = resp.data.cent.functions.map((x) => {
//         return x.slug;
//       });

//       let selectedFunction = "";
//       if (functions.length > 0) {
//         selectedFunction = functions[0];
//       } else {
//         selectedFunction = "";
//       }

//       const viewport = getViewport();
//       const node: TaskScriptNode = {
//         id: nodeId,
//         type: "taskscript",
//         position: {
//           x: -viewport.x + Math.floor(Math.random() * (300 - 100 + 1)) + 100,
//           y: -viewport.y + Math.floor(Math.random() * (300 - 100 + 1)) + 100,
//         },
//         width: 150,
//         data: {
//           label: item.slug,
//           payload: { artifact: item, function: selectedFunction },
//           sourceHandles: [{ id: "input-1" }],
//           targetHandles: [{ id: "output-1" }],
//         },
//       };
//       addNodes([node]);
//     },
//     [addNodes, getViewport, getNodes]
//   );

//   const title = _.startCase(item.extra.slug);

//   const desc =
//     item.extra.namespace + "/" + item.extra.slug + " " + item.extra.version;
//   return (
//     <Flex wrap justify={"space-between"} align="flex-start">
//       <List.Item.Meta
//         title={title}
//         description={desc}
//         style={{ minWidth: "100px", width: "400px" }}
//       />
//       <Space>
//         <Button
//           variant="text"
//           color="default"
//           onClick={() => {
//             onAddNode(item.extra);
//           }}
//           disabled={selectedTemplate == null}
//         >
//           Add node
//         </Button>
//         <Button variant="text" color="default" onClick={onReadMeClick}>
//           Readme
//         </Button>
//       </Space>
//     </Flex>
//   );
// };

// const TaskScriptList = () => {
//   const [searchText, setSearchText] = useState("");
//   const { message } = App.useApp();
//   const simpleModal = useSimpleModal();

//   const {
//     data: queryResult,
//     isLoading,
//     error,
//   } = useSWR(["taskScripts"], () =>
//     apiServices.TaskScriptsApi.getTaskScriptArtifacts({
//       namespaceType: "common",
//       latestOnly: true,
//     })
//   );

//   if (error) {
//     message.error(
//       <>
//         <div>Failed to load task scripts</div>
//         <div>{error.message}</div>
//       </>
//     );
//     console.error(error);
//   }

//   const taskScripts = queryResult?.data ?? [];

//   const onSearchChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>): void => {
//       setSearchText(e.target.value);
//     },
//     []
//   );

//   const onReadMeClick = useCallback(
//     async (item: TaskScriptObject) => {
//       simpleModal.showModal();
//       simpleModal.setLoading(true);
//       apiServices.TaskScriptsHelper.getReadme(item)
//         .then((resp) => {
//           console.log(resp.data);
//           simpleModal.setContent(<TaskScriptReadme artifact={item} />);
//         })
//         .catch((err: AxiosError) => {
//           console.log(err);
//         })
//         .finally(() => {
//           simpleModal.setLoading(false);
//         });
//     },
//     [simpleModal]
//   );

//   let data = taskScripts;

//   if (searchText) {
//     const searchTextLower = searchText.toLowerCase();
//     data = data.filter((item) => {
//       return (
//         item.slug.toLowerCase().includes(searchTextLower) ||
//         item.version.toLowerCase().includes(searchTextLower)
//       );
//     });
//   }

//   return (
//     <Card
//       title={`Task Scripts (${data.length}/${
//         isLoading ? "..." : taskScripts.length
//       })`}
//       style={{ height: "100%" }}
//     >
//       {simpleModal.SimpleModal}
//       <Space direction="vertical" style={{ width: "100%" }}>
//         <Space>
//           <Input
//             style={{ width: "300px" }}
//             placeholder="Search for steps"
//             onChange={onSearchChange}
//           />
//         </Space>
//         <div style={{ overflow: "auto", height: "90%" }}>
//           <SelectableList
//             size="small"
//             loading={isLoading}
//             itemStyle={{ width: "100%" }}
//             data={data.map((item) => {
//               return {
//                 id: item.slug,
//                 title: item.slug,
//                 description: item.version,
//                 extra: item,
//               };
//             })}
//             renderItemContents={(item) => (
//               <TaskScriptListItem
//                 item={item}
//                 onReadMeClick={() => onReadMeClick(item.extra)}
//               />
//             )}
//           />
//         </div>
//       </Space>
//     </Card>
//   );
// };

// export default TaskScriptList;

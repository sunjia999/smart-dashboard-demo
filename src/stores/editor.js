import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useEditorStore = defineStore("editor", () => {
  // 所有组件实例
  const components = ref([]);

  // 当前选中组件
  const selectedComponent = ref(null);

  // 组件类型
  const componentTypes = ref([
    {
      type: "text",
      name: "文本",
      icon: "Document",
      defaultProps: {
        content: "默认文本",
        fontSize: 16,
        color: "#333",
        align: "left",
      },
    },
    {
      type: "chart",
      name: "折线图",
      icon: "PieChart",
      defaultProps: {
        title: "销售额趋势",
        data: [],
        width: "100%",
        height: 300,
      },
    },
    {
      type: "table",
      name: "表格",
      icon: "Grid",
      defaultProps: {
        columns: [],
        data: [],
        pagination: true,
      },
    },
    {
      type: "three",
      name: "3D场景",
      icon: "Box",
      defaultProps: {
        backgroundColor: "#ffffff",
        showGrid: true,
        animation: true,
      },
    },
    {
      type: "realtime",
      name: "实时数据",
      icon: "Connection",
      defaultProps: {
        endpoint: "",
        updateInterval: 1000,
      },
    },
  ]);

  // 添加组件
  const addComponent = (type) => {
    const componentType = componentTypes.value.find((c) => c.type === type);
    if (!componentType) return;

    const newComponent = {
      id: `component_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      type,
      props: JSON.parse(JSON.stringify(componentType.defaultProps)),
      position: { x: 100, y: components.value.length * 100 },
      size: { width: 300, height: 200 },
    };

    components.value.push(newComponent);
    selectedComponent.value = newComponent.id;

    return newComponent;
  };

  // 更新组件属性
  const updateComponentProps = (componentId, props) => {
    const component = components.value.find((c) => c.id === componentId);
    if (component) {
      Object.assign(component.props, props);
    }
  };

  // 删除组件
  const removeComponent = (componentId) => {
    const index = components.value.findIndex((c) => c.id === componentId);
    if (index > -1) {
      components.value.splice(index, 1);
      if (selectedComponent.value === componentId) {
        selectedComponent.value = null;
      }
    }
  };

  // 导出画布配置
  const exportConfig = () => {
    return JSON.stringify(
      {
        components: components.value,
        version: "1.0.0",
        exportTime: new Date().toISOString(),
      },
      null,
      2,
    );
  };

  // 导入画布配置
  const importConfig = (configStr) => {
    try {
      const config = JSON.parse(configStr);
      components.value = config.components || [];
      return true;
    } catch (error) {
      console.error("导入配置失败:", error);
      return false;
    }
  };

  return {
    components,
    selectedComponent,
    componentTypes,
    addComponent,
    updateComponentProps,
    removeComponent,
    exportConfig,
    importConfig,
  };
});

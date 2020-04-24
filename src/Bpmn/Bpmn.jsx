import React from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import customTranslate from "./customTranslate/customTranslate";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
import  "./Bpmn.css";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css";
import { bpmnXML } from "./xml";

const customTranslateModule = {
	translate: ["value", customTranslate]
};
export default class Bpmn extends React.Component {
	state = {
		scale: 1 // 流程图比例
	};
	handleOpen = () => {
		this.file.click();
	};

	// 导入 xml 文件
	handleOpenFile = (e) => {
		const that = this;
		const file = e.target.files[0];
		const reader = new FileReader();
		let data = "";
		reader.readAsText(file);
		reader.onload = function(event) {
			data = event.target.result;
			that.renderDiagram(data, "open");
		};
	};
	// 渲染 xml 格式
	renderDiagram = (xml) => {
		this.viewer.importXML(xml, (err) => {
			if (err) {
				console.log("导入失败")
			}
		});
	};
	// 下载 XML 格式
	handleDownloadXml = () => {
		this.viewer.saveXML({ format: true }, (err, data) => {
			this.download("xml", data);
		});
	};
	// 下载 SVG 格式
	handleDownloadSvg = () => {
		this.viewer.saveSVG({ format: true }, (err, data) => {
			this.download("svg", data);
		});
	};
	/**
	 * 下载xml/svg
	 *  @param  type  类型  svg / xml
	 *  @param  data  数据
	 *  @param  name  文件名称
	 */
	download = (type, data, name) => {
		let dataTrack = "";
		const a = document.createElement("a");

		switch (type) {
			case "xml":
				dataTrack = "bpmn";
				break;
			case "svg":
				dataTrack = "svg";
				break;
			default:
				break;
		}

		name = name || `diagram.${dataTrack}`;

		a.setAttribute("href", `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`);
		a.setAttribute("target", "_blank");
		a.setAttribute("dataTrack", `diagram:download-${dataTrack}`);
		a.setAttribute("download", name);

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};
	// 前进
	handleRedo = () => {
		this.viewer.get("commandStack").redo();
	};
	// 后退
	handleUndo = () => {
		this.viewer.get("commandStack").undo();
	};

	//恢复到原位
	resetView = () => {
		this.viewer.get("canvas").zoom("fit-viewport");
	};
	// 流程图放大缩小
	handleZoom = (radio) => {
		const newScale = !radio
			? 1.0 // 不输入radio则还原
			: this.state.scale + radio <= 0.2 // 最小缩小倍数
			? 0.2
			: this.state.scale + radio;

		this.viewer.get("canvas").zoom(newScale);
		this.setState({
			scale: newScale
		});
	};

	componentDidMount() {
		this.viewer = new BpmnModeler({
			container: "#canvas",
			//添加控制板
			propertiesPanel: {
				parent: "#js-properties-panel"
			},
			additionalModules: [
				// 左边工具栏以及节点
				propertiesProviderModule,
				// 右边的工具栏
				propertiesPanelModule,
				//汉化
				customTranslateModule
			],
			moddleExtensions: {
				camunda: camundaModdleDescriptor
			}
		});
		this.viewer.importXML(bpmnXML, function(err) {
			if (err) {
				// console.error(err)
			} else {
				// 这里是成功之后的回调, 可以在这里做一系列事情
				// this.success()
			}
			// 删除 bpmn logo
			const bjsIoLogo = document.querySelector(".bjs-powered-by");
			while (bjsIoLogo.firstChild) {
				bjsIoLogo.removeChild(bjsIoLogo.firstChild);
			}
		});
	}

	render() {
		return (
			<div className="containers">
				<div className="canvas" id="canvas"></div>
				<div className="panel" id="js-properties-panel" ></div>
				<ul className="buttons">
					<li  onClick={this.handleOpen}>
						<input
							ref={(file) => {
								this.file = file;
							}}
							className="openFile"
							type="file"
							onChange={this.handleOpenFile}
						/>
						导入
					</li>
					<li onClick={this.handleDownloadXml}>导出bpmn</li>
					<li onClick={this.handleDownloadSvg}>导出svg</li>
					<li onClick={() => this.handleZoom(0.1)}>放大</li>
					<li onClick={() => this.handleZoom(-0.1)}>缩小</li>
					<li onClick={() => this.handleZoom()}>还原</li>
					<li onClick={this.handleUndo}>撤销</li>
					<li onClick={this.handleRedo}>恢复</li>
					<li onClick={this.resetView}>复位</li>
				</ul>
			</div>
		);
	}
}

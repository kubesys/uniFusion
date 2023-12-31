import {
  getResourceformsearch,
  getResourcedesc,
  getResourcetable,
  listResources,
  updateResource,
  createResource,
  deleteResource,
} from "@/api/kubernetes"
import { ElMessage } from 'element-plus'

export function frontendData(ListName:string, TableName:string, pageSite:object, tableColumns:[], tableData:[], allLabels:object, actions:[] = [],  region='local', retryCount = 10 ){
  const getResourceData = (retry:any) => {
    listResources({
      fullkind: ListName,
      page: pageSite.value.page,
      limit: pageSite.value.limit,
      labels: allLabels,
      region: region
    }).then((resp) => {
      resp.data.data.items
      tableData.value = resp.data.data;

      /***********************
       *
       * Echarts data
       *
       ***********************/
      var resultRun = 0
      var resultPen = 0
      tableData.value.items.forEach((item: any) => {
        if (item.status !== undefined && item.status.phase === 'Running') {
          resultRun++
        } else if (item.status !== undefined && item.status.phase !== 'Running') {
          resultPen++
        }
      })
      tableData.value.resultRun = resultRun
      tableData.value.resultPen = resultPen

      getResourcetable({
        fullkind: "doslab.io.Frontend",
        name: TableName + '-table',
        namespace: "default",
        region: region
      }).then((resp) => {
        tableColumns.value = resp.data.data.spec.data;

      }).catch((error) => {
        if (retry < retryCount) {
          getResourceData(retry + 1);
        } else {
          ElMessage.error('Request failed' + TableName + '-table');
        }
      });
    }).catch((error) => {
      if (retry < retryCount) {
        getResourceData(retry + 1);
      } else {
        getResourcetable({
          fullkind: "doslab.io.Frontend",
          name: TableName + '-table',
          namespace: "default",
          region: region
        }).then((resp) => {
          tableColumns.value = resp.data.data.spec.data;
        })
      }
    });
  }

  getResourceData(1);
}

export function frontendMeta(TableName:string, descItem: [], region = 'local', retryCount = 10) {
  const getResourceData = (retry:any) => {
    getResourcedesc({
      fullkind: "doslab.io.Frontend",
      name: TableName + '-desc',
      namespace: "default",
      region: region
    })
        .then((resp) => {
          descItem.value = resp.data.data.spec;
        })
        .catch((error) => {
          console.error(error);
          if (retry < retryCount) {
            getResourceData(retry + 1);
          } else{
            ElMessage.error('Request failed' + TableName + '-desc');
          }
        });
  };

  getResourceData(1);
}

export function frontendFormSearch(TableName:string, formItem: [], region = 'local', retryCount = 10) {
  const getResourceData = (retry:any) => {
    getResourceformsearch({
      fullkind: "doslab.io.Frontend",
      name: TableName + '-formsearch',
      namespace: "default",
      region: region
    })
        .then((resp) => {
          formItem.value = resp.data.data.spec.data.items;
        })
        .catch((error) => {
          console.error(error);
          if (retry < retryCount) {
            getResourceData(retry + 1); // 重新发送
          } else {
            ElMessage.error('Request failed,' + TableName + 'formsearch');
          }
        });
  };

  getResourceData(1);
}

// export function frontendAction(TableName:string, step: [], region = 'local', retryCount = 3) {
//   const getResourceData = (retry:any) => {
//     getResource({
//       fullkind: "doslab.io.Frontend",
//       name: TableName + '-action-scale',
//       namespace: "default",
//       region: region
//     })
//         .then((resp) => {
//           console.log(resp.data.data.spec);
//           step.value = resp.data.data.spec;
//         })
//         .catch((error) => {
//           console.error(error);
//           if (retry < retryCount) {
//             getResourceData(retry + 1);
//           } else {
//             console.error('Request failed.');
//           }
//         });
//   };
//
//   getResourceData(1);
// }

export function frontendCreateTemplate(TableName:string, templateSpec: [], region = 'local', retryCount = 3) {
  const getResourceData = (retry:any) => {
    getResource({
      fullkind: "doslab.io.Frontend",
      name: TableName + '-create',
      namespace: "default",
      region: region
    })
        .then((resp) => {
          console.log(resp.data.data.spec);
          templateSpec.value = resp.data.data.spec;
        })
        .catch((error) => {
          console.error(error);
          if (retry < retryCount) {
            getResourceData(retry + 1);
          } else {
            ElMessage.error('Request failed.');
          }
        });
  };

  getResourceData(1);
}

export function frontendUpdate(rowData:object, region = 'local', retryCount = 3) {
  const updateResourceData = (retry:any) => {
    updateResource({
      region: region,
      data: rowData
    })
        .then((resp) => {
        })
        .catch((error) => {
          console.error(error);
          if (retry < retryCount) {
            updateResourceData(retry + 1);
          } else {
            ElMessage.error('Request failed.');
          }
        });
  };
  updateResourceData(1);
}

export function validResponse(response:any) {
  return response != null && response.hasOwnProperty('code') && response.code === 20000
}

export function frontendCreate(jsonData:any, region = 'local'){
  createResource({
    region: region,
    data: jsonData
  }).then((resp)=>{
    if(resp.data.code == 20000){
      ElMessage.success('创建成功.')
    }
  })
}

export function frontendDelete(Listname:string, name:string, region = 'local'){
  deleteResource({
    fullkind: Listname,
    name: name,
    namespace: "default",
    region: region
  }).then((resp)=>{
    if(resp.data.code == 20000){
      ElMessage.success('删除成功.')
    }
  })
}

/******************************************************************************************
 *
 * Tabel various values
 * Url: https://system-iscas.yuque.com/org-wiki-system-iscas-os28is/htugy3/gw06v8ohezh16l3u
 *
 ******************************************************************************************/
export function getComplexDataDispose(scope, rowKey){
  if (rowKey.includes(';/;') && rowKey.indexOf('#') == -1){
    const value = getIncludesValue(scope, rowKey)
    return value
  } else {
    const value = getComplexValue(scope, rowKey)
    return value
  }
}

export function getIncludesValue(scope, key){
  let result = scope
  var arr = []
  key.split(';/;').forEach((item)=>{
    const x = getComplexValue(scope, item)
    arr.push(x)
  })
  arr.join('/')
  return arr.join('/')
}

export function getComplexValue(scope, key){
  if (JSON.stringify(scope) === '{}' || !key) {
    return '-'
  }

  let result = scope

  if (key.startsWith('@')) {
    let newkey = '';
    key.substring(1).split('+').forEach((item) => {
      if (item.includes('apiVersion')) {
        const apiVersion = result[item];
        if (apiVersion) {
          newkey += apiVersion.split('/')[0];
        } else {
          console.log(1);
          // 处理 apiVersion 为 undefined 或 null 的情况
        }
      } else {
        const value = result[item];
        if (value !== undefined && value !== null) {
          newkey += '.' + value;
        } else {
          // console.log(2);
          // 处理 value 为 undefined 或 null 的情况
        }
      }
    });
    // console.log(newkey);
  }


  key.split('.').every((item) => {
    item = item.replaceAll('#', '.')
    if (item.indexOf('[') > 0) {
      result = result[item.substring(0, item.indexOf('['))]
      if (result === undefined || result.length === 0) {
        result = '-'
        return false
      } else {
        result =
            result[
                parseInt(
                    item.substring(item.indexOf('[') + 1, item.indexOf(']'))
                )
                ]
        return true
      }
    } else {
      if (result && result[item] !== undefined) {
        result = result[item]
        return true
      } else {
        result = '⊘'
        return false
      }
    }
  })

  if (result instanceof Object || result instanceof Array) {
    const objResult = new Set()
    for (const key in result) {
      if (result[key] === '') {
        continue
      }
      objResult.add(result[key])
    }
    return objResult
  } else {
    if (result === 'Running') {
      result = '🟢'
    } else if (result === 'Terminating') {
      result = '🔴'
    } else if (result === 'Pending') {
      result = '🔴'
    } else if (result === 'Succeeded') {
      result = '🟢'
    } else if (result === 'Completed') {
      result = '🟢'
    } else if (result === 'Failed') {
      result = '🔴'
    } else if (result === 'Unknown') {
      result = '🔴'
    } else if (result === 'Ready') {
      result = '🟢'
    } else if (result === 'Shutdown') {
      result = '🔴'
    } else if (result === 'Active') {
      result = '🟢'
    }
    else if (key.includes('Memory')) {
      result = result/1024 + 'GB'
    }
    else if (result === 'local') {
      result = '本地服务器'
    } else if (result === 'cloud') {
      result = '公有云资源'
    } else if (result === 'edge') {
      result = '边缘端设备'
    } else if (result === 'master') {
      result = '主控节点'
    } else if (result === 'worker') {
      result = '工作节点'
    } else if (result === 'no-schedule') {
      result = '正在维护'
    } else if (result === 'schedule') {
      result = '正在工作'
    }
    return result
  }
}

export function getTerminalAddr(scope, item) {
  let str = item.target
  let n = ''
  if (str.includes('/e/')) {
    item.values.forEach((item)=>{
      const id = getComplexValue(scope, item + '.lastState.terminated.containerID')
      if (typeof(id) == "string") {
        n = id.substring('docker://'.length);
      }
    })
  } else {
    item.values.forEach((item)=>{
      n = getComplexValue(scope, item)
    })
  }
  let nstr = str.replace(/\{[^\}]+\}/,n);
  return nstr
}


/******************************************************************************************
 *
 * FormSearch various values
 * Url: https://system-iscas.yuque.com/org-wiki-system-iscas-os28is/htugy3/ndh85sggwxtfw93v
 *
 ******************************************************************************************/
export function ConfigMapValue(data:any,ConfigArray:any){
  getResource({
    fullkind: 'ConfigMap',
    name: data.name,
    namespace: data.namespace,
    region: "test"
  }).then((resp) => {
    const result = resp.data.data.data
    const newArrays = Object.keys(result).map(key => {
      return { value: key, label: result[key] };
    })
    const Arr = []
    for (const key in newArrays) {
      // Vue.set(mapper, key, result[key])
      Arr.push(newArrays[key]);
    }
    ConfigArray.value = Arr
  })
}

export function getFormDataValue(data:any, optionArray:any){
  if(data.kind === 'ConfigMap'){
    ConfigMapValue(data, optionArray)
  } else {
    optionArray.value = [{value: 'ecs-253', label:'ecs-253'}]
  }
}

/******************************************************************************************
 *
 * Action various values
 * Url: https://system-iscas.yuque.com/org-wiki-system-iscas-os28is/htugy3/ndh85sggwxtfw93v
 *
 ******************************************************************************************/
export function actionDataValue(TableName:string, ListName:string, dialogVisible, selectedItemName, rowItemData, dialogname:string, action:string, rowData:any){
  if (action === TableName + '-action-scale') {
    dialogVisible.value = true;
    selectedItemName.value = dialogname
    rowItemData.value = rowData.metadata
  } else if (action === 'DELETE') {
    frontendDelete(ListName, rowData.metadata.name)
  } else if (action === 'UPDATE') {
    dialogVisible.value = true;
    selectedItemName.value = dialogname
    rowItemData.value = rowData.metadata
  }
}

/******************************************************************************************
 *
 * Create various values
 * Url: https://system-iscas.yuque.com/org-wiki-system-iscas-os28is/htugy3/ccxy0kdbtsn023wl
 *
 ******************************************************************************************/

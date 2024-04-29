// @ts-nocheck
import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useEffect, useRef, useState } from 'react';

import ReactEcharts from 'echarts-for-react';
import dayjs from 'dayjs';

import { Button, Select } from 'antd';

const data = [
  {
    date: '2023-04-03',
    type: '本年度',
    month: '4 月',
    value: 4,
  },
  {
    date: '2023-04-04',
    type: '本年度',
    month: '4 月',
    value: 67,
  },
  // {
  //   date: '2023-03-12',
  //   type: '本年度',
  //   month: '3 月',
  //   value: 38,
  // },
  // {
  //   date: '2023-04-20',
  //   type: '本年度',
  //   month: '4 月',
  //   value: 55,
  // },
  // {
  //   date: '2023-05-05',
  //   type: '本年度',
  //   month: '5 月',
  //   value: 76,
  // },
  // {
  //   date: '2023-06-10',
  //   type: '本年度',
  //   month: '6 月',
  //   value: 23,
  // },

  // {
  //   date: '2023-09-05',
  //   type: '本年度',
  //   month: '9 月',
  //   value: 33,
  // },
  // {
  //   date: '2023-10-10',
  //   type: '本年度',
  //   month: '10 月',
  //   value: 66,
  // },
  // {
  //   date: '2023-11-15',
  //   type: '本年度',
  //   month: '11 月',
  //   value: 55,
  // },
  // {
  //   date: '2023-12-20',
  //   type: '本年度',
  //   month: '12 月',
  //   value: 99,
  // },
  // {
  //   date: '2022-05-06',
  //   type: '上一年',
  //   month: '5 月',
  //   value: 56,
  // },
  // {
  //   date: '2022-06-07',
  //   type: '上一年',
  //   month: '6 月',
  //   value: 85,
  // },
  // {
  //   date: '2022-07-09',
  //   type: '上一年',
  //   month: '7 月',
  //   value: 45,
  // },
];

// const data = [{
  
//     value: 4.0,
//     date: "2024-04-03",

// }]
const monthSpan = 3;

const colorByYear = {
  thisYear: '#00ADB8',
  lastYear: '#FAD4A6',
};
const TestTrend = ({ chartData, activeYear }) => {
  const chartRef = useRef();
  const [option, setOption] = useState({});
  const [dayList, setDayList] = useState([]);
  const [activeDate, setActiveDate] = useState('');

  const isThisYear = (year) => {
    return year === activeYear;
  };
  // 根据date是否是当前年度返回颜色值
  const getColorByYear = (year) => {
    return isThisYear(year) ? colorByYear.thisYear : colorByYear.lastYear;
  };
  const initOptionFn = (dataByYear, dayList, dataFormat) => { 
    // 根据dataByYear 生成series 暂时默认展示所有数据
    let series = [];
    if (!activeYear) {
      series.push({
        type: 'line',
        data: dataFormat,
        itemStyle: {
          color: colorByYear.thisYear,
        },
        symbol: 'circle',
        symbolSize: 6,
      });
    } else {
      for (const key in dataByYear) {
        series.push({
          type: 'line',
          data: dataByYear[key],
          name: key,
          itemStyle: {
            color: getColorByYear(key),
          },
          symbol: 'circle',
          symbolSize: 6,
        });
      }
    }

    const legend = {
      data: Object.keys(dataByYear),
      orient: 'vertical', // 设置图例垂直排布
      right: 80,
      itemHeight: 0,
      lineStyle: {
        width: 5,
      },
    };
    if (!activeYear) {
      legend.show = false;
    } else {
      legend.show = true;
    }
    function checkDate(data){
      if(data.length !== 2){
        return false;
      }
      if(dayjs(data[0][0]).add(1, 'day').isSame(dayjs(data[1][0]), 'day')){
        return true;
      }
      return false
    }
    let type = 'time';
    let xAxisData = null;
    let showMinLabel = false;
    if(Object.keys(dataByYear).length === 1 && checkDate(dataByYear[legend.data[0]])){
      type = 'category',
      xAxisData = dataByYear[legend.data[0]].map(item => item[0])
      series[0].data = series[0].data.map(item => {
        return item[1]
      })
      showMinLabel = true;
    }
    return {
      xAxis: {
        type,
        data: xAxisData,
        boundaryGap: false,
        axisLabel: {
          showMinLabel,
          // 可自定义x轴展示字段
          formatter: function (value) {
            if( data.length === 1 && dayjs(value).day()!==dayjs(data[0].date).day()){
              return ''
            }
            if(type === 'category'){
              // 若展示数据为相邻两天，则展示年月日
              return `${dayjs(value).format('YYYY-MM-DD')}`;
            }
            if(!activeYear){
              // 选择全部时，可能出现重复月，为区分，则加上了年的展示
              return `${dayjs(value).format('YYYY-MM')}`;
            }
            return `${dayjs(value).format('M')}月`;
          },
        },
        minInterval: 1000 * 60 * 60 * 24 * 30, // 一个月
        maxInterval: data.length === 1 ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 30,
      },
      yAxis: {
        type: 'value',
      },
      legend,
      series,
      dataZoom: [
        {
          type: 'slider',
          show: true,
          filterMode: 'none',
        },
        {
          type: 'inside',
          zoomLock: true,
          filterMode: 'none',
        },
      ],
    };
  };
  useEffect(() => {
    setActiveDate('');
    const chartInstance = chartRef?.current?.getEchartsInstance();
    // 清空图表，避免选择全部时数据异常
    chartInstance.clear();
    const { dataByYear, dayList, dataFormat } = remakeData();

    chartInstance.setOption(initOptionFn(dataByYear, dayList, dataFormat));
    // setOption(initOptionFn(dataByYear, dayList));

    const monthOfFirstDay = parseInt(dayjs(dayList[0].date).format('MM'));

    const getStartAndEndMonthIndex = (month) => {
      const index = dayList.findIndex((item) => {
        return parseInt(dayjs(item.date).format('MM')) === month;
      });
      change(dayList[index], index, dayList);
    };

    getStartAndEndMonthIndex(monthOfFirstDay); // 传入当前想展示的月份
    
    chartInstance.getZr().on('mousemove', function(params){
      const { offsetX, offsetY } = params;
      const indexArray = chartInstance.convertFromPixel('grid', [offsetX,offsetY]);
      const xIndex = indexArray[0];
      // addMarkLine({date: xIndex})
    })
  }, [data, activeYear]);

  // 将日期转化为本年度
  const formatDate = (date) => {
    return `${dayjs().format('YYYY')}-${dayjs(date).format('MM-DD')}`;
  };

  const getYear = (date) => {
    return dayjs(date).format('YYYY');
  };

  const remakeData = () => {
    // 按照日期排序
    const dataSort = data.sort((a, b) => {
      return dayjs(formatDate(a.date)).valueOf() - dayjs(formatDate(b.date)).valueOf();
    });

    const yearMap = new Map();
    const dateMap = new Map();
    dataSort.forEach((item) => {
      const { date, value } = item;
      const dateStr = formatDate(date);

      const year = getYear(date);
      // 根据年度分别压入更新日期后数据
      if (yearMap.has(year)) {
        yearMap.set(year, yearMap.get(year).concat([[dateStr, value]]));
        dateMap.set(year, dateMap.get(year).concat([{ date: dateStr, year }]));
      } else {
        yearMap.set(year, [[dateStr, value]]);
        dateMap.set(year, [{ date: dateStr, year }]);
      }
    });
    const dataByYear = Object.fromEntries(yearMap);
    const dateByYear = Object.fromEntries(dateMap);

    let dayList = [];
    let dataFormat = [];
    // 根据选中年份，获取对应的dayList
    if (activeYear === '') {
      dataFormat = dataSort
        .map((item) => [item.date, item.value])
        .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf());
      dayList = dataFormat.map((item) => {
        return { date: item[0] };
      });
    } else {
      dayList = dateByYear[activeYear];
    }

    dayList = dayList?.sort((a, b) => {
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    });

    setDayList(dayList);

    return {
      dataByYear,
      dayList,
      dataFormat,
    };
  };

  const getDataInDate = (date) => {
    return data.filter((item) => dayjs(item.date).format('MM-DD') === dayjs(date).format('MM-DD'));
  };

  const addMarkLine = ({xAxisIndex, dayList, date}) => {
    const chartInstance = chartRef?.current?.getEchartsInstance();
    const dateX = date ? dayjs(date).format('YYYY-MM-DD') : dayList[xAxisIndex].date;
    const dataList = getDataInDate(dateX);

    if(dataList.length === 0)
    return;
    const markPointData = dataList.map((item) => {
      return {
        xAxis: activeYear ? formatDate(item.date) : item.date,
        yAxis: item.value,
        value: item.value,
      };
    });

    // if (activeYear) {
      let markLine = {
        symbol: 'none', // 去掉箭头
        data: [
          {
            xAxis: dateX, // 选中的 x 轴坐标索引
          },
        ],
        label: {
          show: false, // 分割线是否展示对应日期
          position: 'start', // 标签位置  start/end
          formatter: function (params) {
            return `${dayjs(params.data.coord[0]).format('MM-DD')}`;
          },
        },
        lineStyle: {
          color: '#F9AD9B', // 自定义分割线颜色
        },
      };
      let markPoint = {
        data: markPointData,
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#F9AD9B', // 自定义标记点颜色
        },
        label: {
          offset: [20, 0],
          color: colorByYear.thisYear,
          fontSize: 14,
        },
      };

      chartInstance.setOption({
        series: [
          {
            markLine,
            markPoint,
          },
        ],
      });
    // }
  };

  const change = (item, index, dayList) => {
    const { date } = item;
    const { startValue, endValue } = getStartEndValues(date);
    const chartInstance = chartRef?.current?.getEchartsInstance(); // 更新echarts图表的dataZoom
    chartInstance.setOption({
      dataZoom: [
        {
          type: 'slider',
          show: false,
          filterMode: 'none',
          startValue,
          endValue,
        },
      ],
      xAxis: {
        axisLabel: {
          color: function (value) {
            return isMonthActive(value, dayList[index].date) && colorByYear.thisYear;
          },
        },
      },
    });
    // addMarkLine({index, dayList,date:dayList[index].date});
  };

  const isMonthActive = (value, date) => {
    return dayjs(value).format('YYYY-MM') === dayjs(date).format('YYYY-MM');
  };
  const handleToggleDateBtnClick = (item, index) => {
    setActiveDate(item);
    change(item, index, dayList);
  };

  const getStartEndValues = (selectedDate) => {
    let startValue = dayjs(selectedDate).subtract(monthSpan, 'month').startOf('month');
    let endValue = dayjs(selectedDate).add(monthSpan, 'month').endOf('month');

    // 如果endValue超过了12月，将其设置为12月的最后一天
    if (endValue.month() > 11) {
      endValue = endValue.set('date', 31);
    } else {
      endValue = endValue.add(1, 'month').set('date', 0);
    }

    // 如果startValue小于1月，将其设置为1月的第一天
    if (startValue.month() < 0) {
      startValue = startValue.add(12, 'month').set('date', 1);
    }

    return { startValue: startValue.format('YYYY-MM-DD'), endValue: endValue.format('YYYY-MM-DD') };
  };
  return (
    <div className="scroll max-w-[620px]">
      <ReactEcharts option={option} style={{ height: '400px' }} ref={chartRef} />

      <div className="overflow-x-scroll flex gap-2">
        {activeYear &&
          dayList?.map((item, index) => (
            <Button
              shape="round"
              key={index}
              onClick={() => {
                handleToggleDateBtnClick(item, index);
              }}
              type="primary"
              ghost={item !== activeDate}
            >
              {item.year}-{dayjs(item.date).format('MM-DD')}
            </Button>
          ))}
      </div>
    </div>
  );
};


const MenuGroup = ({ data, currentTab, setCurrentTab }) => {
  return (
    <div className="border-b border-solid border-b-[color:var(--BG-,#DBDBDB)] pb-5 flex gap-[10px]">
      <Button
        onClick={() => {
          setCurrentTab('');
        }}
        className="px-[20px] py-[10px] text-sm leading-5 tracking-wider justify-center items-stretch border bg-white rounded-3xl border-solid h-auto"
      >
        全部
      </Button>
      {
        // data?.year.length > 1 &&
        ['2022', '2023']?.map((item) => {
          return (
            <Button
              className="px-[20px] py-[10px] text-sm leading-5 tracking-wider justify-center items-stretch border bg-white rounded-3xl border-solid h-auto"
              onClick={() => {
                setCurrentTab(item);
              }}
            >
              {item}
            </Button>
          );
        })
      }
    </div>
  );
};

function App() {
  const [activeYear, setActiveYear] = useState('');

  return (
    <div className="App">
      <MenuGroup currentTab={activeYear} setCurrentTab={setActiveYear}></MenuGroup>
      <TestTrend activeYear={activeYear} chartData={[]} />
    </div>
  );
}

export default App;

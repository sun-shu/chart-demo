// @ts-nocheck
import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useEffect, useRef, useState } from 'react';

import ReactEcharts from 'echarts-for-react';
import dayjs from 'dayjs';

import { Button, Select } from 'antd';

const data = [{
  date: '2023-01-05',
  type: '本年度',
  month: '1 月',
  value: 42,
},
  {
    date: '2023-02-03',
    type: '本年度',
    month: '2 月',
    value: 67,
  },
  {
    date: '2023-03-12',
    type: '本年度',
    month: '3 月',
    value: 38,
  },
  {
    date: '2023-04-20',
    type: '本年度',
    month: '4 月',
    value: 55,
  },
  {
    date: '2023-05-05',
    type: '本年度',
    month: '5 月',
    value: 76,
  },
  {
    date: '2023-06-10',
    type: '本年度',
    month: '6 月',
    value: 23,
  },

  {
    date: '2023-09-05',
    type: '本年度',
    month: '9 月',
    value: 33,
  },
  {
    date: '2023-10-10',
    type: '本年度',
    month: '10 月',
    value: 66,
  },
  {
    date: '2023-11-15',
    type: '本年度',
    month: '11 月',
    value: 55,
  },
  {
    date: '2023-12-20',
    type: '本年度',
    month: '12 月',
    value: 99,
  },
  {
    date: '2022-05-06',
    type: '上一年',
    month: '5 月',
    value: 56,
  },
  {
    date: '2022-06-07',
    type: '上一年',
    month: '6 月',
    value: 85,
  },
  {
    date: '2022-07-09',
    type: '上一年',
    month: '7 月',
    value: 45,
  }];

const monthSpan = 3;
const TestTrend = ({ chartData, activeYear }) => {
  const chartRef = useState();
  const [option, setOption] = useState({});
  const [dayList, setDayList] = useState([]);
  const [activeDate, setActiveDate] = useState('');

  const initOptionFn = (dataByYear, dayList) => {
    // 根据dataByYear 生成series 暂时默认展示所有数据
    const series = [];

    console.log('dataByYear4', dataByYear);
    for (const key in dataByYear) {
      console.log('key', key);
      series.push({
        type: 'line',
        data: dataByYear[key],
        name: key,
        lineStyle: {
          color: key === activeYear ? '#00ADB8' : '#FAD4A6',
          width: 3, // 设置线条粗细为5
        },
      });
    }

    return {
      xAxis: {
        type: 'time',
        axisLabel: { // 可自定义x轴展示字段
          formatter: function(value) {
            return dayjs(value).format('MM');
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        lineStyle: {
          color: 'red',
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          color: '#D9F0F2',
        },
        axisLabel: {
          color: '#00ADB8',
        },
      },
      legend: {
        data: Object.keys(dataByYear),
        itemStyle: {
          borderCap: 'square',
        },
      },
      series,
      dataZoom: [{
        type: 'slider',
        show: true,
        filterMode: 'none',
      }, {
        type: 'inside',
        zoomLock: true,
        filterMode: 'none',
      }],

    };
  };
  useEffect(() => {
    setActiveDate('');
    const chartInstance = chartRef?.current?.getEchartsInstance();

    const { dataByYear, dayList } = remakeData();


    chartInstance.setOption(initOptionFn(dataByYear, dayList));
    // setOption(initOptionFn(dataByYear, dayList));

    const monthOfFirstDay = parseInt(dayjs(dayList[0].date).format('MM'));

    const getStartAndEndMonthIndex = (month) => {
      const index = dayList.findIndex(item => {
        return parseInt(dayjs(item.date).format('MM')) === month;
      });
      change(dayList[index], index, dayList);
    };

    getStartAndEndMonthIndex(monthOfFirstDay); // 传入当前想展示的月份
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

    console.log('dataSort', dataSort);
    const yearMap = new Map();
    const dateMap = new Map();
    dataSort.forEach(item => {
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
    // 根据选中年份，获取对应的dayList
    if (activeYear === '') {
      for (const key in dataByYear) {
        dayList = dayList.concat(dateByYear[key]);
      }
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
    };
  };

  const getDataInDate = (date) => {
    return data.filter(item => dayjs(item.date).format('MM-DD') === dayjs(date).format('MM-DD'));
  };

  const addMarkLine = (xAxisIndex, dayList) => {
    const chartInstance = chartRef?.current?.getEchartsInstance();

    const date = dayList[xAxisIndex].date;
    const dataList = getDataInDate(date);
    const markPointData = dataList.map(item => {
      return {
        xAxis: formatDate(item.date),
        yAxis: item.value,
        value: item.value,
      };
    });


    chartInstance.setOption({
      series: [
        {
          markLine: {

            symbol: 'none', // 去掉箭头
            data: [{
              xAxis: date, // 选中的 x 轴坐标索引
            }],
            label: {
              show: true, // 分割线是否展示对应日期
              position: 'start', // 标签位置  start/end
              formatter: function(params) {
                return `${dayjs(params.data.coord[0]).format('MM-DD')}`;
              },
              borderType: 'solid',

            },

            lineStyle: {
              color: '#F9AD9B', // 自定义分割线颜色
              type: 'solid',
              width: 2,
            },
          },
          markPoint: {
            data: markPointData,
            symbol: 'circle',
            symbolSize: 20,
            itemStyle: {
              color: '#F9AD9B', // 自定义标记点颜色
            },
            label: {
              color: '#00ADB8',// 自定义标记点颜色
              position: 'right',
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
        },

      ],
    });
  };

  const change = (item, index, dayList) => {
    setActiveDate(item);
    let start, end;
    // 点击日期放在中间（数据中间）（若日期密度不确定则可能出现当前选中数据出现在非中间的其他位置）
    start = index - monthSpan < 0 ? 0 : (index - monthSpan);
    end = start + 2 * monthSpan;

    if (end > dayList.length) {
      end = dayList.length;
      start = end - 2 * monthSpan;
    }

    // 点击日期放在中间（月份中间）
    // 根据全部数据获取月份，将当前月份至于中间，展示前后三个月数据（若日期密度不确定，则可能导致charts图一边密一边稀疏的情况）
    const month = dayjs(item).format('MM');
    // 获取当前月份的索引
    const indexMonth = dayList.findIndex(item => dayjs(item.date).format('MM') === month);
    let startMonthIndex = dayList.findIndex(item => parseInt(dayjs(item.date).format('MM')) === parseInt(month) - 3);
    if (startMonthIndex < 0) startMonthIndex = 0;
    // 获取当前月份的索引
    const startMonth = dayjs(dayList[start]?.date).format('MM');
    let endMonth = parseInt(startMonth) + 2 * monthSpan;
    if (endMonth > 12) {
      endMonth = 12;
    }
    if (indexMonth !== -1) {
      start = startMonthIndex < 0 ? 0 : startMonthIndex;
      end = dayList.findIndex(item => parseInt(dayjs(item.date).format('MM')) === endMonth);
    }

    if (endMonth >= 12) {
      end = dayList.length - 1;
      start = dayList.findIndex(item => parseInt(dayjs(item.date).format('MM')) === parseInt(endMonth) - 2 * monthSpan);
    }

    const chartInstance = chartRef?.current?.getEchartsInstance();

    // 更新echarts图表的dataZoom
    chartInstance.setOption({
      dataZoom: [
        {
          type: 'slider',
          show: false,
          filterMode: 'none',
          startValue: dayList[start]?.date,
          endValue: dayList[end]?.date,
        },
      ],

    });

    addMarkLine(index, dayList);
  };


  const handleToggleDateBtnClick = (item, index) => {

    change(item, index, dayList);
  };

  return (
      <div className="scroll max-w-[620px]">
        <ReactEcharts option={option} style={{ height: '400px' }} ref={chartRef} />

        <div className="overflow-x-scroll flex gap-2">
          {activeYear && dayList?.map((item, index) => (
              <Button shape="round" key={index} onClick={() => {
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
            className='px-[20px] py-[10px] text-sm leading-5 tracking-wider justify-center items-stretch border bg-white rounded-3xl border-solid h-auto'
        >
          全部
        </Button>
        {
          // data?.year.length > 1 &&
          ['2022', '2023']?.map((item) => {
            return <Button
                className='px-[20px] py-[10px] text-sm leading-5 tracking-wider justify-center items-stretch border bg-white rounded-3xl border-solid h-auto'
                onClick={() => {
                  setCurrentTab(item);
                }}
            >
              {item}
            </Button>;
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
      <TestTrend activeYear={activeYear}  chartData={[]}/>

    </div>
  );
}

export default App;

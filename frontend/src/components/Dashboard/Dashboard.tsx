"use client";
import React from "react";
import ExecutionTableOne from "../Charts/ExecutionTableOne";
import ExecutionTableTwo from "../Charts/ExecutionTableTwo";
import CardDataStats from "../CardDataStats";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

const Dashboard: React.FC = () => {
  const [totalflow, setTotalFlow] = useState([]);
  const [totalstep, setTotalStep] = useState([]);
  const [totalGoodStep, setTotalGoodStep] = useState([]);
  const [chartOneAll, setChartOneAll] = useState([]);
  const [chartTwoAll, setChartTwoAll] = useState([]);
  const [chartOneSucess, setChartOneSucess] = useState([]);
  const [chartTwoSucess, setChartTwoSucess] = useState([]);
  const [totalclient, setTotalClient] = useState([]);
  const [totalExecution, setTotalExecution] = useState([]);
  const [totalSuccessful, setTotalSuccessful] = useState([]);
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/dashboard/chartone/",
        );
        const data = await res.json();
        setChartOneAll(data.data.total_logs_per_month);
        setChartOneSucess(data.data.success_logs_per_month);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchTwoData = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/dashboard/charttwo/",
        );
        const data = await res.json();
        setChartTwoAll(data.data.total_logs_per_week);
        setChartTwoSucess(data.data.success_logs_per_week);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    fetchTwoData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/dashboard/overview/",
        );
        const data = await res.json();
        const overviewData = JSON.parse(data.total_workflow);
        console.log("TTE", overviewData);
        setTotalFlow(overviewData);
        setTotalExecution(data.total_steps);
        setTotalSuccessful(data.total_steps_with_result);
        console.log("TTE", data.total_workflows);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    setTotalClient("1");

    fetchData();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title={t("total_workflows")}
          // total={totalflow ? totalflow : ""}
          total={
            totalflow.length < 1 ? (
              <div>
                <img
                  src={"/images/general/loading.gif"}
                  alt="Saving"
                  className=" h-6 w-6 animate-spin"
                />
              </div>
            ) : (
              totalflow
            )
          } // total={totalflow}
        >
          <svg
            width="35"
            height="30"
            viewBox="0 0 1024 1024"
            className="fill-primary dark:fill-white"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M746.666667 768h85.333333V469.333333H554.666667v-192h-85.333334v192H192v298.666667h85.333333V554.666667h192v213.333333h85.333334V554.666667h192z"
              fill="#CFD8DC"
            />
            <path
              d="M362.666667 128h298.666666v213.333333H362.666667z"
              fill="#3F51B5"
            />
            <path
              d="M682.666667 682.666667h213.333333v213.333333H682.666667zM128 682.666667h213.333333v213.333333H128zM405.333333 682.666667h213.333334v213.333333H405.333333z"
              fill="#00BCD4"
            />
          </svg>
        </CardDataStats>
        <CardDataStats title={t("total_client")} total={totalclient}>
          <svg
            className="fill-primary dark:fill-white"
            width="35"
            height="30"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              d="M462.136,433.096H49.864L256,76.864L462.136,433.096z M77.624,417.096H434.4L256,108.8
	L77.624,417.096z"
            />
            <g>
              <rect x="206.448" y="31.888" width="99.096" height="99.096" />
              <rect x="412.904" y="381.016" width="99.096" height="99.096" />
              <rect y="381.016" width="99.096" height="99.096" />
            </g>
          </svg>
        </CardDataStats>
        <CardDataStats
          title={t("total_execution")}
          total={
            totalExecution.length < 1 ? (
              <div>
                <img
                  src={"/images/general/loading.gif"}
                  alt="Saving"
                  className=" h-6 w-6 animate-spin"
                />
              </div>
            ) : (
              totalExecution
            )
          }
        >
          <svg
            className="fill-primary dark:fill-white"
            width="35"
            height="30"
            viewBox="0 0 24 24"
            version="1.1"
          >
            <title>run_line</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g id="Transport" transform="translate(-816.000000, 0.000000)">
                <g id="run_line" transform="translate(816.000000, 0.000000)">
                  <path
                    d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z"
                    id="MingCute"
                    fill-rule="nonzero"
                  ></path>
                  <path
                    d="M13,2 C14.6569,2 16,3.34315 16,5 C16,6.4374176 14.989097,7.6387305 13.6394248,7.93171628 L13.469,7.96356 L14.9049,10.261 L16.6286,9.57152 C17.1414,9.36641 17.7234,9.61583 17.9285,10.1286 C18.11895,10.6047714 17.9175097,11.1406102 17.4771844,11.3789437 L17.3714,11.4285 L15.6477,12.118 C14.8018647,12.4562588 13.842291,12.1788775 13.3046353,11.4607677 L13.2089,11.321 L13.0463,11.0609 L12.4403,13.4851 C12.38606,13.7019 12.298348,13.901548 12.184076,14.0798456 L12.0935,14.2095 L13.7468,15.4376 C14.1430667,15.732 14.4146519,16.161037 14.5132351,16.640361 L14.542,16.8223 L14.895,20 L15,20 C15.5523,20 16,20.4477 16,21 C16,21.51285 15.613973,21.9355092 15.1166239,21.9932725 L15,22 L14.0895,22 C13.5690357,22 13.1258286,21.63665 13.0156081,21.1386974 L12.9962,21.0215 L12.5542,17.0431 L9.40368,14.7028 C9.34671,14.6605 9.29553,14.6132 9.2503,14.5621 C8.69851333,14.1200733 8.40463653,13.4019044 8.52705735,12.6715052 L8.55972,12.5149 L9.35399,9.33783 L7.78454,9.80867 L6.94868,12.3162 C6.77404,12.8402 6.20772,13.1233 5.68377,12.9487 C5.19725429,12.7864786 4.9183499,12.286602 5.0208232,11.7965551 L5.05132,11.6838 L5.88717,9.17621 C6.07583833,8.61019583 6.50617896,8.16078701 7.05678434,7.94576318 L7.20984,7.89302 L10.6474,6.86174 C10.2421,6.3502 10,5.70337 10,5 C10,3.34315 11.3431,2 13,2 Z M8.2,15.4 C8.53137,14.9582 9.15817,14.8686 9.6,15.2 C10.0078154,15.5059077 10.1155314,16.0635172 9.86903487,16.4949808 L9.8,16.6 L8.5838,18.2216 C8.13599375,18.8186938 7.32402148,18.990309 6.67848165,18.6455613 L6.55175,18.5697 L4.62197,17.2832 C4.22939,17.5957 3.65616,17.5704 3.29289,17.2071 C2.93241,16.8466385 2.90468077,16.2793793 3.20970231,15.8871027 L3.29289,15.7929 L3.7871,15.2987 C4.09658182,14.9892455 4.56555124,14.9173942 4.94922239,15.107564 L5.06152,15.1725 L7.26759,16.6432 L8.2,15.4 Z M13,4 C12.4477,4 12,4.44772 12,5 C12,5.55228 12.4477,6 13,6 C13.5523,6 14,5.55228 14,5 C14,4.44772 13.5523,4 13,4 Z"
                    id="形状"
                    fill="#09244B"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
        </CardDataStats>
        <CardDataStats
          title={t("total_successful")}
          total={
            totalSuccessful.length < 1 ? (
              <div>
                <img
                  src={"/images/general/loading.gif"}
                  alt="Saving"
                  className=" h-6 w-6 animate-spin"
                />
              </div>
            ) : (
              totalSuccessful
            )
          }
        >
          <svg
            width="26"
            className="fill-primary dark:fill-white"
            height="30"
            viewBox="0 0 64 64"
            data-name="Layer 1"
            id="Layer_1"
          >
            <defs></defs>
            <title />
            <path d="M41.78,57.13a7.12,7.12,0,0,1-4.2-1.39l-4.32-3.16a3.12,3.12,0,0,0-3.7,0l-4.32,3.16a7.14,7.14,0,0,1-11.31-6.53l.58-5.32a3.11,3.11,0,0,0-1.85-3.2L7.77,38.53a7.13,7.13,0,0,1,0-13.06l4.89-2.16a3.11,3.11,0,0,0,1.85-3.2l-.58-5.32A7.14,7.14,0,0,1,25.24,8.26l4.32,3.16a3.12,3.12,0,0,0,3.7,0l4.32-3.16A7,7,0,0,1,43,7a7.25,7.25,0,0,1,4.75,3.13,2,2,0,1,1-3.34,2.2,3.23,3.23,0,0,0-2.12-1.39,3,3,0,0,0-2.37.57l-4.32,3.16a7.13,7.13,0,0,1-8.43,0l-4.31-3.16a3.13,3.13,0,0,0-5,2.87l.58,5.31A7.11,7.11,0,0,1,14.28,27l-4.9,2.16a3.14,3.14,0,0,0,0,5.74L14.28,37a7.11,7.11,0,0,1,4.21,7.3l-.58,5.31a3.13,3.13,0,0,0,5,2.87l4.31-3.16a7.13,7.13,0,0,1,8.43,0l4.32,3.16a3.13,3.13,0,0,0,5-2.87l-.58-5.31A7.1,7.1,0,0,1,48.54,37l4.9-2.16a3.14,3.14,0,0,0,0-5.74L50.78,28a2,2,0,1,1,1.61-3.66l2.66,1.17a7.13,7.13,0,0,1,0,13.06l-4.89,2.16a3.13,3.13,0,0,0-1.86,3.2l.58,5.32a7,7,0,0,1-3.52,6.95A7.17,7.17,0,0,1,41.78,57.13Z" />
            <path
              class="cls-2"
              d="M31.64,39a2,2,0,0,1-1.42-.59l-8.61-8.61A2,2,0,1,1,24.44,27l7.2,7.2L57.08,8.72a2,2,0,0,1,2.82,2.83L33.05,38.4A2,2,0,0,1,31.64,39Z"
            />
          </svg>
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ExecutionTableOne
          allCount={chartOneAll}
          allSucessCount={chartOneSucess}
        />
        <ExecutionTableTwo
          allCount={chartTwoAll}
          allSucessCount={chartTwoSucess}
        />
      </div>
    </>
  );
};

export default Dashboard;

# Site Speed Overview Dashboard
## Sample with the random data

This example is made to show the overview of the speed of any website.

We have tried to make it a comfortable, visually appealing, and easy to grasp.

To use real data and delete the streaming section:

1. index.html 10 line - remove .css file include
2. index.html 40-44 lines - remove div
3. index.html 59-60 lines - remove files includes
4. src/css/styles.css - remove last line (width: 70%;)
5. add the following code to the page onReady function:


    ```
    drawCharts();
    updateChartsData(YOUR_REAL_CSV_DATA_STRING);
    ```



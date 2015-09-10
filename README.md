# Site Speed Overview Dashboard
## Sample with fake random data

This example was made to overview the speed any particular site works with.

We have tried to make it a comfortable, visually appealing, and easy to grasp.

  
To use real data and delete streaming section:

1. index.html 10 line - remove including .css file
2. index.html 40-44 lines - remove div
3. index.html 59-60 lines - remove including files 
4. src/css/styles.css - remove last line (width: 70%;)
5. add following code in page onReady function:


    ```
    drawCharts();
    updateChartsData(YOUR_REAL_CSV_DATA_STRING);
    ```



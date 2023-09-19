<template>
  <div class="container">
    <button @click="deleteSelectedRecords" class="rounded btn btn-outline-light btn-block mt-3 mb-3 float-right">Delete Selected</button>
    <!-- Display search results with custom pagination -->
    <table class="table mt-3 mb-3">
      <thead>
        <tr>
          <th scope="col">Select</th>
          <th scope="col">Name</th>
          <th scope="col">Time Zone</th>
          <th scope="col">Local Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(location, index) in paginatedResults" :key="index">
          <td>
            <input type="checkbox" v-model="selectedLocations" :value="location" />
          </td>
          <td>{{ location.name || '-' }}</td>
          <td>{{ location.timeZone || '-' }}</td>
          <td>{{ location.localTime ? formatLocalTime(location.localTime) : '-' }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Custom pagination -->
    <ul class="pagination">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a class="page-link" @click="setCurrentPage(currentPage - 1)" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <li class="page-item" v-for="page in pageCount" :key="page" :class="{ active: currentPage === page }">
        <a class="page-link" @click="setCurrentPage(page)" href="#">{{ page }}</a>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === pageCount }">
        <a class="page-link" @click="setCurrentPage(currentPage + 1)" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  inject: ["eventBus"],
  props: {
    searchResults: Array,
  },
  setup(props, { emit }) {
    const { searchResults } = toRefs(props);
    const selectedLocations = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = 10;

    const paginatedResults = ref([]);
    console.log("searchResults in TableFx.vue:", searchResults);

    const setCurrentPage = (newPage) => {
      currentPage.value = newPage;
    };

    const deleteSelectedRecords = () => {
      emit("delete-selected", selectedLocations.value);
    };

    const pageCount = searchResults.value ? Math.ceil(searchResults.value.length / itemsPerPage) : 0;

    // Watch for changes in searchResults and update paginatedResults accordingly
    watch(searchResults, () => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      paginatedResults.value = searchResults.value.slice(startIndex, endIndex);
    });

    // Helper function to format local time (you can define your own format)
    const formatLocalTime = (time) => {
      // Implement your formatting logic here
      return time;
    };

    return {
      selectedLocations,
      deleteSelectedRecords,
      currentPage,
      setCurrentPage,
      paginatedResults,
      pageCount,
      formatLocalTime, // Make the formatLocalTime function accessible in the template
    };
  },
});
</script>

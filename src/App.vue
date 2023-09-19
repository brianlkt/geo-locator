<template>
  <div class="container">
    <!-- Search input and button -->
    <div class=" mt-3 alert alert-light" role="alert">
      <h1>Location Finder</h1>
      <p>Please enable location permission to use this app.</p>
    </div>
    <div class="input-group mb-3">
      <input
        ref="searchInput"   
        class="form-control rounded"
        aria-label="Large"
        aria-describedby="inputGroup-sizing-sm"
        placeholder="Type where you want to search..."
        v-model="localSearchQuery"
        @keyup.enter="search"
      />
      <button
        class="input-group-append rounded btn btn-primary btn-large ms-2"
        @click="search"
      >
        Search
      </button>
      <button
        class="input-group-append rounded btn btn-outline-light ms-2 btn-large"
        @click="getMyLocale"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        <span v-else>Get My Location</span>
      </button>
    </div>
    <button class="btn btn-outline-danger btn-large justify-content-right" @click="deleteSelectedRecords">Delete Selected Records</button>
 
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
    <custom-pagination
      :current-page="currentPage"
      :page-count="pageCount"
      @page-change="onPageChange"
    ></custom-pagination>
    <!-- Display the map with markers -->
    <div class="mb-4"> 
      <GoogleMap
        api-key="AIzaSyAyGuJCBy-Pf7RqNAJEChAlLl8AiQsmTzQ"
        style="width: 100%; height: 40vh"
        :center="center"
        :zoom="15"
      >
        <!-- Display markers for search results -->
        <Marker
          v-for="(location, index) in searchResults"
          :key="index"
          :options="{
            position: { lat: location.lat, lng: location.lng },
          }"
        />
      </GoogleMap>
    </div>
    
  </div>
</template>


<script>
import CustomPagination from "@/components/CustomPagination.vue";
import { GoogleMap, Marker } from "vue3-google-map";
import { defineComponent, ref, computed , onMounted} from "vue";
import moment from "moment-timezone";

export default defineComponent({
  components: { GoogleMap, Marker, CustomPagination },
  setup() {
    const localSearchQuery = ref("");
    const isLoading = ref(false);
    const center = ref({ lat: 43.7481532, lng: -79.2894009 });
    const searchResults = ref([]);
    const selectedLocations = ref([]);
    const currentPage = ref(1);
    const perPage = ref(10);

    // Ref for the search input element
    const searchInput = ref(null);

    // Add a keyup event listener on the entire component
    onMounted(() => {
      window.addEventListener("keyup", (event) => {
        if (event.key === "/" && searchInput.value) {
          searchInput.value.focus();
        }
      });
    });

    const onPageChange = (newPage) => {
      currentPage.value = newPage;
    };

    const pageCount = computed(() => {
      return Math.ceil(searchResults.value.length / perPage.value);
    });

    const paginatedResults = computed(() => {
      const start = (currentPage.value - 1) * perPage.value;
      const end = start + perPage.value;
      return searchResults.value.slice(start, end);
    });

    const fetchTimezoneAndLocalTime = async (location) => {
      try {
        const apiKey = "AIzaSyAyGuJCBy-Pf7RqNAJEChAlLl8AiQsmTzQ";
        const timestamp = Math.floor(Date.now() / 1000);

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=${timestamp}&key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch timezone data.");
        }

        const data = await response.json();

        if (data.status === "OK") {
          const timezoneId = data.timeZoneId;
          const localTime = moment()
            .tz(timezoneId)
            .format("YYYY-MM-DD HH:mm:ss");

          location.timeZone = timezoneId;
          location.localTime = localTime;
        } else {
          throw new Error("Failed to fetch timezone data.");
        }
      } catch (error) {
        console.error("Error fetching timezone data:", error);
      }
    };

    const search = async () => {
      if (localSearchQuery.value.trim() === "") {
        alert("Please enter a location to search.");
        return;
      }

      isLoading.value = true;

      try {
        const apiKey = "AIzaSyAyGuJCBy-Pf7RqNAJEChAlLl8AiQsmTzQ";
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            localSearchQuery.value
          )}&key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data from the server.");
        }

        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          const result = data.results[0];
          const location = {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            name: result.formatted_address,
            timeZone: "",
            localTime: "",
          };

          await fetchTimezoneAndLocalTime(location);

          center.value = { lat: location.lat, lng: location.lng };
          searchResults.value.push(location);

          localSearchQuery.value = "";
        } else {
          alert("No results found for the provided location.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching data.");
      } finally {
        isLoading.value = false;
      }
    };

    const getMyLocale = () => {
      if ("geolocation" in navigator) {
        isLoading.value = true;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            center.value = { lat: userLat, lng: userLng };

            const location = {
              lat: userLat,
              lng: userLng,
              name: "Your Location",
              timeZone: "",
              localTime: "",
            };

            fetchTimezoneAndLocalTime(location);
            searchResults.value.push(location);
            isLoading.value = false;
          },
          (error) => {
            console.error("Error getting user location:", error);
            isLoading.value = false;
            alert("Geolocation access is denied. Please enable location permission in your browser settings.");

          }
        );
      } else {
        alert("Geolocation is not available in your browser.");
      }
    };

    const deleteSelectedRecords = () => {
      searchResults.value = searchResults.value.filter((location) => {
        return !selectedLocations.value.includes(location);
      });

      selectedLocations.value = [];
    };

    const formatLocalTime = (time) => {
      return time;
    };

    return {
      localSearchQuery,
      isLoading,
      center,
      searchResults,
      formatLocalTime,
      search,
      getMyLocale,
      deleteSelectedRecords,
      selectedLocations,
      perPage,
      pageCount,
      paginatedResults,
      onPageChange,
      searchInput,
    };
  },
});
</script>

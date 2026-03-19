FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY dotnet-api/DataPulse.API/DataPulse.API.csproj dotnet-api/DataPulse.API/
RUN dotnet restore dotnet-api/DataPulse.API/DataPulse.API.csproj

COPY dotnet-api/DataPulse.API/ dotnet-api/DataPulse.API/
WORKDIR /src/dotnet-api/DataPulse.API
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "DataPulse.API.dll"]

FROM mcr.microsoft.com/dotnet/sdk:10.0.400 AS build
WORKDIR /source
COPY dotnet-tools.json ./
COPY src/ ./src/
RUN dotnet restore src/XFood.Api/XFood.Api.csproj
RUN dotnet publish src/XFood.Api/XFood.Api.csproj --configuration Release --no-restore --output /publish /p:UseAppHost=false

# Used only by the disposable CI environment, never by the deployment workflow.
FROM build AS migration-build
RUN dotnet tool restore
ENV ConnectionStrings__XFood="Server=unused.invalid;Database=DesignTime"
RUN dotnet tool run dotnet-ef migrations bundle --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext --configuration Release --output /bundle/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS migrate
WORKDIR /app
COPY --from=migration-build /bundle/efbundle ./efbundle
COPY --from=build /publish/appsettings.json ./appsettings.json
USER $APP_UID
ENTRYPOINT ["./efbundle"]

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN mkdir -p /app/keys && chown "$APP_UID" /app/keys
COPY --from=build /publish/ ./
ENV ASPNETCORE_HTTP_PORTS=8080
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "XFood.Api.dll"]
